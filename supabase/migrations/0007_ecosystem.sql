-- ============================================================================
-- PoraSathi (পড়াসাথী) — 0007: Ecosystem
-- ----------------------------------------------------------------------------
-- Payment-ready structure (payment_methods/transactions — payment gateway পরে),
-- coaching centers, course notes, better matching (AI-ready, এখনো rule-based),
-- nationwide districts update। সব ছোট টেবিল + count-ভিত্তিক।
-- Idempotent — safe to re-run.
-- ============================================================================

-- ============================================================================
-- 1. Payment-ready structure (bKash/Nagad/card — gateway পরে, এখন placeholder)
-- ============================================================================
do $$
begin
  create type public.payment_method as enum ('bkash','nagad','card','manual');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_status as enum ('pending','paid','failed','refunded');
exception when duplicate_object then null;
end $$;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  plan text not null default 'free',  -- free | premium
  method public.payment_method,
  amount numeric,
  status public.payment_status not null default 'pending',
  started_at timestamptz not null default now(),
  expires_at timestamptz
);

create index if not exists subscriptions_profile_idx on public.subscriptions (profile_id, status);

-- ============================================================================
-- 2. Coaching centers
-- ============================================================================
create table if not exists public.coaching_centers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  description text,
  district text,
  area text,
  contact text,
  website text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coaching_centers_district_idx on public.coaching_centers (district);

create table if not exists public.coaching_courses (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.coaching_centers (id) on delete cascade,
  title text not null check (char_length(title) between 2 and 120),
  description text,
  price numeric,
  created_at timestamptz not null default now()
);

create index if not exists coaching_courses_center_idx on public.coaching_courses (center_id);

-- ============================================================================
-- 3. Education resources (notes/materials marketplace — ছোট শুরু)
-- ============================================================================
create table if not exists public.education_resources (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 2 and 140),
  description text,
  resource_url text not null,
  subject text,
  class_level text,
  price numeric default 0,
  created_at timestamptz not null default now()
);

create index if not exists education_resources_subject_idx on public.education_resources (subject);

-- ============================================================================
-- 4. Better matching — match_tuitions_for_teacher (teacher-এর জন্য opportunity)
--    আর match score-এ price/value adjust (AI-এর জায়গা, এখন rule-based)
-- ============================================================================
create or replace function public.match_tuitions_for_teacher(
  p_teacher_id uuid,
  p_limit int default 10
)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_total bigint;
  v_results json;
begin
  select count(*) into v_total
  from public.tuitions t
  join public.profiles po on po.id = t.poster_id
  join public.teacher_profiles tp on tp.id = p_teacher_id
  where t.status = 'open'
    and po.account_status = 'active'
    and (tp.subjects @> array[t.subject] or tp.classes_taught @> array[t.class_level]);

  select coalesce(json_agg(x order by x.score desc, x.created_at desc), '[]'::json)
  into v_results
  from (
    select
      t.id, t.title, t.class_level, t.subject, t.district, t.area,
      t.budget, t.teaching_mode, t.preferred_days, t.status, t.created_at,
      po.full_name as poster_name, po.display_name as poster_display_name, po.role as poster_role,
      public.compute_match_score(p_teacher_id, t.class_level, t.subject,
        t.district, t.area, t.latitude, t.longitude, t.teaching_mode, t.budget, t.preferred_days) as score,
      public.distance_between(t.latitude, t.longitude, p.latitude, p.longitude) as distance_km
    from public.tuitions t
    join public.profiles po on po.id = t.poster_id
    join public.teacher_profiles tp on tp.id = p_teacher_id
    left join public.profiles p on p.id = p_teacher_id
    where t.status = 'open'
      and po.account_status = 'active'
      and (tp.subjects @> array[t.subject] or tp.classes_taught @> array[t.class_level])
    limit least(coalesce(p_limit,10),50)
  ) x;

  return json_build_object('total', v_total, 'results', v_results);
end;
$$;

-- Teacher opportunity RPC (new)
create or replace function public.match_tuitions_for_teacher_rpc(
  p_teacher_id uuid,
  p_limit int default 10
)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select public.match_tuitions_for_teacher(p_teacher_id, p_limit);
$$;

-- ============================================================================
-- 5. RLS + privileges
-- ============================================================================
alter table public.subscriptions enable row level security;
alter table public.coaching_centers enable row level security;
alter table public.coaching_courses enable row level security;
alter table public.education_resources enable row level security;

-- subscriptions: নিজের দেখবে, admin সব; নিজেরটা insert (payment পরে confirm হবে)
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
  for select to authenticated using (auth.uid() = profile_id or public.is_admin());
drop policy if exists "subscriptions_insert_own" on public.subscriptions;
create policy "subscriptions_insert_own" on public.subscriptions
  for insert to authenticated with check (auth.uid() = profile_id);

-- coaching centers: সবাই পড়তে পারে (public marketplace), owner manage
drop policy if exists "coaching_centers_select_all" on public.coaching_centers;
create policy "coaching_centers_select_all" on public.coaching_centers
  for select to authenticated using (true);
drop policy if exists "coaching_centers_insert_own" on public.coaching_centers;
create policy "coaching_centers_insert_own" on public.coaching_centers
  for insert to authenticated with check (auth.uid() = owner_id);
drop policy if exists "coaching_centers_update_own" on public.coaching_centers;
create policy "coaching_centers_update_own" on public.coaching_centers
  for update to authenticated using (auth.uid() = owner_id or public.is_admin()) with check (auth.uid() = owner_id or public.is_admin());

-- courses: center owner manage, সবাই পড়তে
drop policy if exists "coaching_courses_select_all" on public.coaching_courses;
create policy "coaching_courses_select_all" on public.coaching_courses
  for select to authenticated using (true);
drop policy if exists "coaching_courses_insert_owner" on public.coaching_courses;
create policy "coaching_courses_insert_owner" on public.coaching_courses
  for insert to authenticated
  with check (exists (select 1 from public.coaching_centers c where c.id = coaching_courses.center_id and c.owner_id = auth.uid()));

-- education resources: public read, uploader manage
drop policy if exists "education_resources_select_all" on public.education_resources;
create policy "education_resources_select_all" on public.education_resources
  for select to authenticated using (true);
drop policy if exists "education_resources_insert_own" on public.education_resources;
create policy "education_resources_insert_own" on public.education_resources
  for insert to authenticated with check (auth.uid() = uploader_id);
drop policy if exists "education_resources_delete_own" on public.education_resources;
create policy "education_resources_delete_own" on public.education_resources
  for delete to authenticated using (auth.uid() = uploader_id or public.is_admin());

grant select, insert on public.subscriptions to authenticated;
grant select, insert, update on public.coaching_centers to authenticated;
grant select, insert on public.coaching_courses to authenticated;
grant select, insert, delete on public.education_resources to authenticated;

grant execute on function public.match_tuitions_for_teacher_rpc(uuid, int) to authenticated;
