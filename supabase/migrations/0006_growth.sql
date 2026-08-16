-- ============================================================================
-- PoraSathi (পড়াসাথী) — 0006: Growth (Premium, Featured, Referral, Analytics)
-- ----------------------------------------------------------------------------
-- Payment এখনো নেই (Phase 5)। Premium/Featured flag-ভিত্তিক — admin বা
-- প্রিমিয়াম teacher set করে। ডাটা/স্টোরেজ minimal: সব count head:true,
-- নতুন টেবিল ছোট, profile view শুধু ১টা int counter।
-- Idempotent — safe to re-run.
-- ============================================================================

-- ============================================================================
-- 1. Columns — premium / featured / meeting link / profile views / referral
-- ============================================================================
alter table public.profiles
  add column if not exists referral_code text unique,
  add column if not exists is_premium boolean not null default false,
  add column if not exists premium_until timestamptz;

alter table public.teacher_profiles
  add column if not exists profile_views integer not null default 0;

alter table public.tuitions
  add column if not exists is_featured boolean not null default false,
  add column if not exists featured_until timestamptz,
  add column if not exists meeting_link text;

-- ============================================================================
-- 2. Referrals (ছোট টেবিল)
-- ============================================================================
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles (id) on delete cascade,
  referred_id uuid references public.profiles (id) on delete set null,
  code text not null,
  created_at timestamptz not null default now(),
  constraint referrals_referred_unique unique (referred_id)
);

create index if not exists referrals_referrer_idx on public.referrals (referrer_id);

-- ============================================================================
-- 3. Referral code generator + signup trigger আপডেট
-- ============================================================================
create or replace function public.gen_referral_code()
returns text
language sql
volatile
as $$
  select 'PS' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$;

-- handle_new_user আপডেট — referral_code সহ profile তৈরি
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_role public.user_role; v_name text;
begin
  v_role := case
    when new.raw_user_meta_data ->> 'role' in ('student','teacher','guardian')
      then (new.raw_user_meta_data ->> 'role')::public.user_role
    else 'student'
  end;
  v_name := coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), new.email);
  insert into public.profiles (id, role, full_name, referral_code)
  values (new.id, v_role, v_name, public.gen_referral_code())
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- পুরনো user-দের জন্য backfill (referral_code null হলে)
update public.profiles set referral_code = public.gen_referral_code() where referral_code is null;

-- রেফারেল কোড দিয়ে signup করলে referrer-কে link করো
create or replace function public.handle_referral()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_code text; v_referrer uuid;
begin
  v_code := nullif(trim(new.raw_user_meta_data ->> 'referral_code'), '');
  if v_code is null then return new; end if;
  select id into v_referrer from public.profiles where referral_code = v_code limit 1;
  if v_referrer is null or v_referrer = new.id then return new; end if;
  insert into public.referrals (referrer_id, referred_id, code)
  values (v_referrer, new.id, v_code)
  on conflict (referred_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_referral on auth.users;
create trigger on_auth_user_referral
  after insert on auth.users
  for each row execute function public.handle_referral();

-- ============================================================================
-- 4. Profile view counter (১টা int — minimal write)
-- ============================================================================
create or replace function public.record_profile_view(p_teacher_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.teacher_profiles set profile_views = profile_views + 1 where id = p_teacher_id;
end;
$$;

-- প্রিমিয়াম active কিনা (expiry check সহ)
create or replace function public.is_premium_active(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(is_premium and (premium_until is null or premium_until > now()), false)
  from public.profiles where id = p_profile_id;
$$;

-- ============================================================================
-- 5. search_teachers — premium boost + is_premium field
-- ============================================================================
create or replace function public.search_teachers(
  p_class text default null,
  p_subject text default null,
  p_district text default null,
  p_area text default null,
  p_lat double precision default null,
  p_lon double precision default null,
  p_max_distance_km double precision default null,
  p_mode text default null,
  p_gender text default null,
  p_min_experience int default null,
  p_min_rating numeric default null,
  p_verified boolean default null,
  p_sort text default 'relevance',
  p_page int default 1,
  p_page_size int default 12
)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_offset int := greatest(coalesce(p_page,1)-1, 0) * least(coalesce(p_page_size,12), 50);
  v_total bigint;
  v_results json;
begin
  select count(*) into v_total
  from public.teacher_profiles tp
  join public.profiles p on p.id = tp.id
  where p.role = 'teacher' and p.account_status = 'active'
    and (p_class is null or tp.classes_taught @> array[p_class])
    and (p_subject is null or tp.subjects @> array[p_subject])
    and (p_district is null or coalesce(p.district,'') = '' or lower(coalesce(p.district,'')) = lower(coalesce(p.district,'')))
    and (p_area is null or coalesce(p.area,'') = '' or lower(coalesce(p.area,'')) = lower(coalesce(p.area,'')))
    and (p_mode is null or tp.teaching_mode = p_mode or tp.teaching_mode = 'both')
    and (p_gender is null or p.gender = p_gender)
    and (p_min_experience is null or coalesce(tp.experience_years,0) >= p_min_experience)
    and (p_min_rating is null or coalesce(tp.rating_avg,0) >= p_min_rating)
    and (p_verified is null or (p_verified = false) or (p_verified = true and p.verification_status = 'verified'))
    and (p_max_distance_km is null or p_lat is null or p_lon is null
         or p.latitude is null or p.longitude is null
         or public.distance_km(p_lat, p_lon, p.latitude, p.longitude) <= p_max_distance_km);

  select coalesce(json_agg(x), '[]'::json) into v_results from (
    select tp.id, p.full_name, p.display_name, p.avatar_url, p.district, p.area, p.gender, p.verification_status,
      p.is_premium, p.premium_until,
      tp.headline, tp.education, tp.subjects, tp.classes_taught, tp.experience_years, tp.teaching_mode, tp.teaching_area,
      tp.expected_salary, tp.available_days, tp.available_time, tp.bio, tp.rating_avg, tp.review_count,
      public.distance_between(p_lat, p_lon, p.latitude, p.longitude) as distance_km
    from public.teacher_profiles tp join public.profiles p on p.id = tp.id
    where p.role = 'teacher' and p.account_status = 'active'
      and (p_class is null or tp.classes_taught @> array[p_class])
      and (p_subject is null or tp.subjects @> array[p_subject])
      and (p_district is null or coalesce(p.district,'') = '' or lower(coalesce(p.district,'')) = lower(coalesce(p.district,'')))
      and (p_area is null or coalesce(p.area,'') = '' or lower(coalesce(p.area,'')) = lower(coalesce(p.area,'')))
      and (p_mode is null or tp.teaching_mode = p_mode or tp.teaching_mode = 'both')
      and (p_gender is null or p.gender = p_gender)
      and (p_min_experience is null or coalesce(tp.experience_years,0) >= p_min_experience)
      and (p_min_rating is null or coalesce(tp.rating_avg,0) >= p_min_rating)
      and (p_verified is null or (p_verified = false) or (p_verified = true and p.verification_status = 'verified'))
      and (p_max_distance_km is null or p_lat is null or p_lon is null
           or p.latitude is null or p.longitude is null
           or public.distance_km(p_lat, p_lon, p.latitude, p.longitude) <= p_max_distance_km)
    order by
      (p.is_premium and (p.premium_until is null or p.premium_until > now())) desc,
      case when p_sort = 'nearest' then coalesce(public.distance_between(p_lat,p_lon,p.latitude,p.longitude), 999999) end asc,
      case when p_sort = 'rating' then coalesce(tp.rating_avg,0) end desc,
      case when p_sort = 'experience' then coalesce(tp.experience_years,0) end desc,
      case when p_sort = 'newest' then extract(epoch from tp.created_at) end desc,
      (p.verification_status = 'verified') desc, coalesce(tp.rating_avg,0) desc, coalesce(tp.experience_years,0) desc
    limit least(coalesce(p_page_size,12),50) offset v_offset
  ) x;

  return json_build_object('total', v_total, 'page', greatest(coalesce(p_page,1),1),
    'page_size', least(coalesce(p_page_size,12),50), 'results', v_results);
end;
$$;

-- ============================================================================
-- 6. search_tuitions — featured first + is_featured/meeting_link
-- ============================================================================
create or replace function public.search_tuitions(
  p_class text default null, p_subject text default null,
  p_district text default null, p_area text default null,
  p_min_budget numeric default null, p_max_budget numeric default null,
  p_mode text default null, p_day text default null, p_time text default null,
  p_page int default 1, p_page_size int default 12)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_offset int := greatest(coalesce(p_page,1)-1,0) * least(coalesce(p_page_size,12),50);
  v_total bigint; v_results json;
begin
  select count(*) into v_total
  from public.tuitions t join public.profiles po on po.id = t.poster_id
  where (p_class is null or t.class_level = p_class)
    and (p_subject is null or t.subject = p_subject)
    and (p_district is null or lower(coalesce(t.district,'')) = lower(p_district))
    and (p_area is null or lower(coalesce(t.area,'')) = lower(p_area))
    and (p_min_budget is null or coalesce(t.budget,0) >= p_min_budget)
    and (p_max_budget is null or coalesce(t.budget,0) <= p_max_budget)
    and (p_mode is null or t.teaching_mode = p_mode or t.teaching_mode = 'both')
    and (p_day is null or t.preferred_days @> array[p_day])
    and (p_time is null or coalesce(t.preferred_time,'') ilike '%' || p_time || '%');

  select coalesce(json_agg(x), '[]'::json) into v_results from (
    select t.id, t.title, t.class_level, t.subject, t.district, t.area, t.budget, t.budget_negotiable,
      t.teaching_mode, t.preferred_days, t.preferred_time, t.requirements, t.status, t.created_at,
      t.is_featured, t.featured_until, t.meeting_link,
      t.poster_id, po.full_name as poster_name, po.display_name as poster_display_name,
      po.role as poster_role, po.avatar_url as poster_avatar
    from public.tuitions t join public.profiles po on po.id = t.poster_id
    where (p_class is null or t.class_level = p_class)
      and (p_subject is null or t.subject = p_subject)
      and (p_district is null or lower(coalesce(t.district,'')) = lower(p_district))
      and (p_area is null or lower(coalesce(t.area,'')) = lower(p_area))
      and (p_min_budget is null or coalesce(t.budget,0) >= p_min_budget)
      and (p_max_budget is null or coalesce(t.budget,0) <= p_max_budget)
      and (p_mode is null or t.teaching_mode = p_mode or t.teaching_mode = 'both')
      and (p_day is null or t.preferred_days @> array[p_day])
      and (p_time is null or coalesce(t.preferred_time,'') ilike '%' || p_time || '%')
    order by
      (t.is_featured and (t.featured_until is null or t.featured_until > now())) desc,
      t.created_at desc
    limit least(coalesce(p_page_size,12),50) offset v_offset
  ) x;

  return json_build_object('total', v_total, 'page', greatest(coalesce(p_page,1),1),
    'page_size', least(coalesce(p_page_size,12),50), 'results', v_results);
end;
$$;

-- ============================================================================
-- 7. get_public_teacher — is_premium যোগ
-- ============================================================================
create or replace function public.get_public_teacher(p_teacher_id uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(row_to_json(t)::json, 'null'::json)
  from (
    select
      tp.id, p.full_name, p.display_name, p.avatar_url, p.gender,
      p.district, p.area, p.verification_status, p.is_premium, p.premium_until,
      tp.headline, tp.education, tp.institution, tp.qualifications, tp.subjects,
      tp.classes_taught, tp.experience_years, tp.teaching_mode, tp.teaching_area,
      tp.expected_salary, tp.available_days, tp.available_time, tp.bio,
      tp.rating_avg, tp.review_count, tp.profile_views, tp.created_at
    from public.teacher_profiles tp
    join public.profiles p on p.id = tp.id
    where tp.id = p_teacher_id
      and p.role = 'teacher'
      and p.account_status = 'active'
  ) t;
$$;

-- ============================================================================
-- 8. RLS + privileges (referrals)
-- ============================================================================
alter table public.referrals enable row level security;

drop policy if exists "referrals_select_own" on public.referrals;
create policy "referrals_select_own" on public.referrals
  for select to authenticated
  using (auth.uid() = referrer_id or auth.uid() = referred_id or public.is_admin());

grant select on public.referrals to authenticated;

grant execute on function public.record_profile_view(uuid) to anon, authenticated;
grant execute on function public.is_premium_active(uuid) to anon, authenticated;
