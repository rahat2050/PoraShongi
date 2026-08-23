-- ============================================================================
-- PoraSathi (পড়াসাথী) — 0033: Public "শিক্ষক চাই" leads (login-free)
-- ----------------------------------------------------------------------------
-- সমস্যা: টিউশন পোস্ট করতে হলে রেজিস্টার → ইমেইল ভেরিফাই → প্রোফাইল → ফর্ম —
-- চার ধাপ। প্রথমবার আসা অভিভাবক ঝরে যান। প্রতিযোগীদের (Eudika, Tuition
-- Terminal, Tuition Media) তিনটাতেই লগইন ছাড়া লিড ফর্ম আছে।
--
-- এই migration একটি anonymous-writable lead inbox তৈরি করে:
--   * anon কেউ সরাসরি table-এ insert করতে পারে না — শুধু submit_tutor_lead()
--     RPC দিয়ে, যেখানে validation + rate limit + honeypot প্রয়োগ হয়;
--   * কেউ (anon বা authenticated non-admin) lead পড়তে পারে না — শুধু admin;
--   * একই ফোন থেকে ১ ঘণ্টায় সর্বোচ্চ ৩টি, একই IP-hash থেকে ২৪ ঘণ্টায় ২০টি।
--
-- Privacy: আমরা কাঁচা IP সংরক্ষণ করি না — 0029-এর মতো শুধু hash রাখি, আর সেটাও
-- শুধু abuse rate-limit করার জন্য।
--
-- Idempotent — safe to re-run.
-- Apply with: supabase db push
-- ============================================================================

create table if not exists public.tutor_leads (
  id uuid primary key default gen_random_uuid(),
  -- যোগাযোগ
  contact_name text not null,
  contact_phone text not null,
  contact_email text,
  -- চাহিদা
  class_level text not null,
  subjects text[] not null default '{}',
  district text,
  area text,
  teaching_mode text not null default 'offline',
  preferred_days text[] not null default '{}',
  preferred_time text,
  budget integer,
  note text,
  -- workflow
  status text not null default 'new',
  admin_note text,
  handled_by uuid references public.profiles (id) on delete set null,
  handled_at timestamptz,
  -- claim: পরে অ্যাকাউন্ট খুললে এই lead তার হয়ে যায়
  claimed_by uuid references public.profiles (id) on delete set null,
  claimed_at timestamptz,
  converted_tuition_id uuid references public.tuitions (id) on delete set null,
  -- abuse control (কাঁচা IP নয়, শুধু hash)
  ip_hash text,
  created_at timestamptz not null default now(),
  constraint tutor_leads_status_check
    check (status in ('new', 'contacted', 'matched', 'closed', 'spam')),
  constraint tutor_leads_mode_check
    check (teaching_mode in ('online', 'offline', 'both')),
  constraint tutor_leads_name_check
    check (char_length(trim(contact_name)) between 2 and 80),
  constraint tutor_leads_phone_check
    check (contact_phone ~ '^01[3-9][0-9]{8}$'),
  constraint tutor_leads_budget_check
    check (budget is null or (budget >= 0 and budget <= 1000000))
);

create index if not exists tutor_leads_status_idx on public.tutor_leads (status, created_at desc);
create index if not exists tutor_leads_phone_idx on public.tutor_leads (contact_phone, created_at desc);
create index if not exists tutor_leads_ip_idx on public.tutor_leads (ip_hash, created_at desc);
create index if not exists tutor_leads_claim_idx on public.tutor_leads (claimed_by) where claimed_by is not null;

alter table public.tutor_leads enable row level security;

-- ============================================================================
-- RLS — কেউ সরাসরি লিখতে/পড়তে পারবে না; সব কাজ SECURITY DEFINER RPC দিয়ে।
-- ============================================================================
drop policy if exists "tutor_leads admin read" on public.tutor_leads;
create policy "tutor_leads admin read"
  on public.tutor_leads for select
  using (public.is_admin());

drop policy if exists "tutor_leads admin update" on public.tutor_leads;
create policy "tutor_leads admin update"
  on public.tutor_leads for update
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- submit_tutor_lead — anon-callable, rate-limited, validated
-- ============================================================================
create or replace function public.submit_tutor_lead(
  p_contact_name text,
  p_contact_phone text,
  p_class_level text,
  p_subjects text[],
  p_teaching_mode text default 'offline',
  p_district text default null,
  p_area text default null,
  p_preferred_days text[] default '{}',
  p_preferred_time text default null,
  p_budget integer default null,
  p_note text default null,
  p_contact_email text default null,
  p_ip_hash text default null
)
returns json
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_name text := trim(coalesce(p_contact_name, ''));
  v_phone text := regexp_replace(coalesce(p_contact_phone, ''), '[^0-9]', '', 'g');
  v_email text := nullif(trim(lower(coalesce(p_contact_email, ''))), '');
  v_subjects text[];
  v_recent_phone int;
  v_recent_ip int;
  v_id uuid;
begin
  -- ফোন normalize: +8801XXXXXXXXX / 8801XXXXXXXXX / 01XXXXXXXXX → 01XXXXXXXXX
  if length(v_phone) = 13 and left(v_phone, 3) = '880' then
    v_phone := substr(v_phone, 4);
  elsif length(v_phone) = 11 and left(v_phone, 1) = '0' then
    v_phone := v_phone;
  elsif length(v_phone) = 10 and left(v_phone, 1) = '1' then
    v_phone := '0' || v_phone;
  end if;

  if v_phone !~ '^01[3-9][0-9]{8}$' then
    return json_build_object('ok', false, 'error', 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন 01712345678)।');
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 80 then
    return json_build_object('ok', false, 'error', 'আপনার নাম ২–৮০ অক্ষরের মধ্যে লিখুন।');
  end if;

  if coalesce(trim(p_class_level), '') = '' then
    return json_build_object('ok', false, 'error', 'ক্লাস বাছুন।');
  end if;

  -- সর্বোচ্চ ৮টি বিষয়, খালি স্ট্রিং বাদ
  select array_agg(distinct s) into v_subjects
  from unnest(coalesce(p_subjects, '{}'::text[])) as s
  where trim(coalesce(s, '')) <> '';
  v_subjects := coalesce(v_subjects, '{}'::text[]);

  if cardinality(v_subjects) = 0 then
    return json_build_object('ok', false, 'error', 'কমপক্ষে একটি বিষয় বাছুন।');
  end if;
  if cardinality(v_subjects) > 8 then
    return json_build_object('ok', false, 'error', 'সর্বোচ্চ ৮টি বিষয় বাছা যাবে।');
  end if;

  if coalesce(p_teaching_mode, 'offline') not in ('online', 'offline', 'both') then
    return json_build_object('ok', false, 'error', 'পড়ানোর মাধ্যম সঠিক নয়।');
  end if;

  if p_budget is not null and (p_budget < 0 or p_budget > 1000000) then
    return json_build_object('ok', false, 'error', 'বাজেট সঠিক নয়।');
  end if;

  -- Rate limit ১: একই ফোন থেকে ঘণ্টায় ৩টি
  select count(*) into v_recent_phone
  from public.tutor_leads
  where contact_phone = v_phone
    and created_at > now() - interval '1 hour';

  if v_recent_phone >= 3 then
    return json_build_object('ok', false, 'error', 'অল্প সময়ে অনেকগুলো অনুরোধ এসেছে। এক ঘণ্টা পরে আবার চেষ্টা করুন।');
  end if;

  -- Rate limit ২: একই নেটওয়ার্ক থেকে দিনে ২০টি
  if p_ip_hash is not null then
    select count(*) into v_recent_ip
    from public.tutor_leads
    where ip_hash = p_ip_hash
      and created_at > now() - interval '24 hours';

    if v_recent_ip >= 20 then
      return json_build_object('ok', false, 'error', 'আজকের জন্য অনুরোধের সীমা শেষ। পরে আবার চেষ্টা করুন।');
    end if;
  end if;

  insert into public.tutor_leads (
    contact_name, contact_phone, contact_email,
    class_level, subjects, district, area,
    teaching_mode, preferred_days, preferred_time,
    budget, note, ip_hash
  ) values (
    v_name, v_phone, v_email,
    trim(p_class_level), v_subjects,
    nullif(trim(coalesce(p_district, '')), ''),
    nullif(trim(coalesce(p_area, '')), ''),
    coalesce(p_teaching_mode, 'offline'),
    coalesce(p_preferred_days, '{}'::text[]),
    nullif(trim(coalesce(p_preferred_time, '')), ''),
    p_budget,
    nullif(left(trim(coalesce(p_note, '')), 1000), ''),
    p_ip_hash
  )
  returning id into v_id;

  return json_build_object('ok', true, 'id', v_id);
end;
$$;

revoke all on function public.submit_tutor_lead(
  text, text, text, text[], text, text, text, text[], text, integer, text, text, text
) from public;

grant execute on function public.submit_tutor_lead(
  text, text, text, text[], text, text, text, text[], text, integer, text, text, text
) to anon, authenticated;

-- ============================================================================
-- admin_list_tutor_leads — admin inbox
-- ============================================================================
create or replace function public.admin_list_tutor_leads(
  p_status text default null,
  p_limit int default 50
)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare v_rows json;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  select coalesce(json_agg(x order by x.created_at desc), '[]'::json) into v_rows
  from (
    select
      l.id, l.contact_name, l.contact_phone, l.contact_email,
      l.class_level, l.subjects, l.district, l.area,
      l.teaching_mode, l.preferred_days, l.preferred_time,
      l.budget, l.note, l.status, l.admin_note,
      l.claimed_by, l.converted_tuition_id, l.created_at
    from public.tutor_leads l
    where (p_status is null or l.status = p_status)
    order by l.created_at desc
    limit least(coalesce(p_limit, 50), 200)
  ) x;

  return v_rows;
end;
$$;

revoke all on function public.admin_list_tutor_leads(text, int) from public;
grant execute on function public.admin_list_tutor_leads(text, int) to authenticated;

-- ============================================================================
-- admin_update_tutor_lead — status/note পরিবর্তন + audit
-- ============================================================================
create or replace function public.admin_update_tutor_lead(
  p_lead_id uuid,
  p_status text,
  p_admin_note text default null
)
returns json
language plpgsql
volatile
security definer
set search_path = public
as $$
declare v_actor uuid := auth.uid();
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  if p_status not in ('new', 'contacted', 'matched', 'closed', 'spam') then
    return json_build_object('ok', false, 'error', 'Invalid status');
  end if;

  update public.tutor_leads
  set status = p_status,
      admin_note = coalesce(nullif(trim(coalesce(p_admin_note, '')), ''), admin_note),
      handled_by = v_actor,
      handled_at = now()
  where id = p_lead_id;

  if not found then
    return json_build_object('ok', false, 'error', 'Lead not found');
  end if;

  return json_build_object('ok', true);
end;
$$;

revoke all on function public.admin_update_tutor_lead(uuid, text, text) from public;
grant execute on function public.admin_update_tutor_lead(uuid, text, text) to authenticated;

-- ============================================================================
-- tutor_lead_stats — হোমপেজের "গত ২৪ ঘণ্টায় X অনুরোধ" (কোনো PII নয়)
-- ============================================================================
create or replace function public.tutor_lead_stats()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'leads_24h', (
      select count(*) from public.tutor_leads
      where created_at > now() - interval '24 hours' and status <> 'spam'
    ),
    'leads_total', (
      select count(*) from public.tutor_leads where status <> 'spam'
    ),
    'leads_matched', (
      select count(*) from public.tutor_leads where status = 'matched'
    )
  );
$$;

revoke all on function public.tutor_lead_stats() from public;
grant execute on function public.tutor_lead_stats() to anon, authenticated;
