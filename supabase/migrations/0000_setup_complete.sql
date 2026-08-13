-- ============================================================================
-- PoraSathi (পড়াসাথী) — RESET + FULL SETUP
-- A platform by FS Coaching
-- ----------------------------------------------------------------------------
-- ⚠️ এই ফাইল একবারই run করো (SQL Editor-এ পুরোটা paste করে Run)।
--    এটি পুরনো সব table/function মুছে নতুন করে সব তৈরি করবে।
--    (তোমার project-এ এখনো কোনো user/data নেই, তাই কিছু হারাবে না)
-- ============================================================================

-- 1) পুরনো trigger সরাও (পুরনো handle_new_user ফাংশনকে reference করছে)
drop trigger if exists on_auth_user_created on auth.users;

-- 2) পুরনো public schema সম্পূর্ণ সরাও
drop schema if exists public cascade;

-- 3) নতুন public schema
create schema public;
grant usage on schema public to anon, authenticated, service_role;

-- ============================================================================
-- PoraSathi (পড়াসাথী) — A platform by FS Coaching
-- Backend Phase 1 (BP1): Database Foundation & Auth
-- ----------------------------------------------------------------------------
-- Supabase → SQL Editor → New query → এই পুরো ফাইল paste করে Run করো।
-- Idempotent — safe to re-run.
-- ============================================================================

-- Extensions -----------------------------------------------------------------
create extension if not exists pgcrypto;

-- Enums ----------------------------------------------------------------------
do $$
begin
  create type public.user_role as enum ('student', 'teacher', 'guardian', 'admin');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.account_status as enum ('active', 'suspended', 'pending', 'deleted');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.verification_status as enum ('unverified', 'pending', 'verified', 'rejected');
exception when duplicate_object then null;
end $$;

-- ============================================================================
-- profiles — প্রতি auth user-এর জন্য এক row (base profile)
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'student',
  full_name text,
  display_name text,
  avatar_url text,
  -- Location (দূরত্ব হিসাবের জন্য): district + area (thana/upazila) + gps (private)
  district text,
  area text,
  latitude double precision,
  longitude double precision,
  gender text,
  is_minor boolean not null default false,
  guardian_consent boolean not null default false,
  account_status public.account_status not null default 'active',
  verification_status public.verification_status not null default 'unverified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Base profile — one row per authenticated user.';
comment on column public.profiles.latitude is 'Approximate location (PRIVATE — never shown). Used only for distance.';
comment on column public.profiles.longitude is 'Approximate location (PRIVATE — never shown). Used only for distance.';

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_district_idx on public.profiles (district);
create index if not exists profiles_area_idx on public.profiles (area);

-- ============================================================================
-- Role-specific profiles (1:1 with profiles)
-- ============================================================================
create table if not exists public.student_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  grade text,
  student_group text,
  institution text,
  subjects_of_interest text[],
  teaching_mode_preference text,
  budget numeric,
  preferred_days text[],
  preferred_time text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teacher_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  headline text,
  bio text,
  education text,
  institution text,
  subjects text[],
  qualifications text[],
  classes_taught text[],
  experience_years smallint check (experience_years between 0 and 80),
  teaching_mode text,
  teaching_area text,
  expected_salary numeric,
  available_days text[],
  available_time text,
  rating_avg numeric not null default 0,
  review_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.guardian_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  relationship_to_student text,
  contact_preference text,
  linked_student_id uuid references public.profiles (id) on delete set null,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists teacher_profiles_subjects_idx on public.teacher_profiles using gin (subjects);
create index if not exists teacher_profiles_classes_idx on public.teacher_profiles using gin (classes_taught);
create index if not exists student_profiles_subjects_idx on public.student_profiles using gin (subjects_of_interest);

-- ============================================================================
-- Triggers
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists student_profiles_set_updated_at on public.student_profiles;
create trigger student_profiles_set_updated_at before update on public.student_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists teacher_profiles_set_updated_at on public.teacher_profiles;
create trigger teacher_profiles_set_updated_at before update on public.teacher_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists guardian_profiles_set_updated_at on public.guardian_profiles;
create trigger guardian_profiles_set_updated_at before update on public.guardian_profiles
  for each row execute function public.set_updated_at();

-- is_admin() helper ----------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and account_status = 'active'
  );
$$;

-- handle_new_user: signup-এ automatically profile তৈরি ----------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
  v_name text;
begin
  v_role := case
    when new.raw_user_meta_data ->> 'role' in ('student', 'teacher', 'guardian')
      then (new.raw_user_meta_data ->> 'role')::public.user_role
    else 'student'
  end;
  v_name := coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), new.email);

  insert into public.profiles (id, role, full_name)
  values (new.id, v_role, v_name)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- handle_profile_role: role-specific profile sync ---------------------------
create or replace function public.handle_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  case new.role
    when 'student' then
      insert into public.student_profiles (id) values (new.id) on conflict (id) do nothing;
    when 'teacher' then
      insert into public.teacher_profiles (id) values (new.id) on conflict (id) do nothing;
    when 'guardian' then
      insert into public.guardian_profiles (id) values (new.id) on conflict (id) do nothing;
    else null;
  end case;
  return new;
end;
$$;

drop trigger if exists on_profile_role_created on public.profiles;
create trigger on_profile_role_created
  after insert on public.profiles
  for each row execute function public.handle_profile_role();

-- prevent_role_change: user নিজের role বদলাতে পারবে না -----------------------
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role and not public.is_admin() then
    raise exception 'You are not allowed to change your role.';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_change on public.profiles;
create trigger profiles_prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- ============================================================================
-- Row Level Security — user শুধু নিজের data দেখতে/এডিট করতে পারবে
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.teacher_profiles enable row level security;
alter table public.guardian_profiles enable row level security;

-- profiles -------------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_delete_admin" on public.profiles;
create policy "profiles_delete_admin" on public.profiles
  for delete to authenticated using (public.is_admin());

-- student_profiles -----------------------------------------------------------
drop policy if exists "student_profiles_select_own" on public.student_profiles;
create policy "student_profiles_select_own" on public.student_profiles
  for select to authenticated using (auth.uid() = id or public.is_admin());

drop policy if exists "student_profiles_insert_own" on public.student_profiles;
create policy "student_profiles_insert_own" on public.student_profiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists "student_profiles_update_own" on public.student_profiles;
create policy "student_profiles_update_own" on public.student_profiles
  for update to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

drop policy if exists "student_profiles_delete_admin" on public.student_profiles;
create policy "student_profiles_delete_admin" on public.student_profiles
  for delete to authenticated using (public.is_admin());

-- teacher_profiles -----------------------------------------------------------
drop policy if exists "teacher_profiles_select_own" on public.teacher_profiles;
create policy "teacher_profiles_select_own" on public.teacher_profiles
  for select to authenticated using (auth.uid() = id or public.is_admin());

drop policy if exists "teacher_profiles_insert_own" on public.teacher_profiles;
create policy "teacher_profiles_insert_own" on public.teacher_profiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists "teacher_profiles_update_own" on public.teacher_profiles;
create policy "teacher_profiles_update_own" on public.teacher_profiles
  for update to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

drop policy if exists "teacher_profiles_delete_admin" on public.teacher_profiles;
create policy "teacher_profiles_delete_admin" on public.teacher_profiles
  for delete to authenticated using (public.is_admin());

-- guardian_profiles ----------------------------------------------------------
drop policy if exists "guardian_profiles_select_own" on public.guardian_profiles;
create policy "guardian_profiles_select_own" on public.guardian_profiles
  for select to authenticated using (auth.uid() = id or public.is_admin());

drop policy if exists "guardian_profiles_insert_own" on public.guardian_profiles;
create policy "guardian_profiles_insert_own" on public.guardian_profiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists "guardian_profiles_update_own" on public.guardian_profiles;
create policy "guardian_profiles_update_own" on public.guardian_profiles
  for update to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

drop policy if exists "guardian_profiles_delete_admin" on public.guardian_profiles;
create policy "guardian_profiles_delete_admin" on public.guardian_profiles
  for delete to authenticated using (public.is_admin());

-- ============================================================================
-- Privileges
-- ============================================================================
revoke all on public.profiles, public.student_profiles, public.teacher_profiles, public.guardian_profiles from anon, public;

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.student_profiles to authenticated;
grant select, insert, update, delete on public.teacher_profiles to authenticated;
grant select, insert, update, delete on public.guardian_profiles to authenticated;

grant usage on type public.user_role to authenticated;
grant usage on type public.account_status to authenticated;
grant usage on type public.verification_status to authenticated;

grant execute on function public.is_admin() to authenticated;
-- ============================================================================
-- PoraSathi (পড়াসাথী) — A platform by FS Coaching
-- Backend Phase 2 (BP2): Marketplace Data + Search + Matching
-- ----------------------------------------------------------------------------
-- 0001_foundation.sql চালানোর পরে এটা চালাও।
-- Idempotent — safe to re-run.
-- ============================================================================

-- Enums ----------------------------------------------------------------------
do $$
begin
  create type public.tuition_status as enum ('open', 'assigned', 'paused', 'completed', 'closed');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.request_status as enum ('pending', 'accepted', 'rejected', 'withdrawn');
exception when duplicate_object then null;
end $$;

-- ============================================================================
-- tuitions — tuition requirement / post
-- ============================================================================
create table if not exists public.tuitions (
  id uuid primary key default gen_random_uuid(),
  poster_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid references public.profiles (id) on delete set null,
  title text not null check (char_length(title) between 3 and 140),
  class_level text not null,
  subject text not null,
  district text,
  area text,
  latitude double precision,
  longitude double precision,
  budget numeric check (budget >= 0),
  budget_negotiable boolean not null default false,
  teaching_mode text not null default 'offline',
  preferred_days text[],
  preferred_time text,
  requirements text,
  status public.tuition_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.tuitions.latitude is 'Approximate tuition location (PRIVATE). Used for distance.';

create index if not exists tuitions_poster_idx on public.tuitions (poster_id);
create index if not exists tuitions_class_idx on public.tuitions (class_level);
create index if not exists tuitions_subject_idx on public.tuitions (subject);
create index if not exists tuitions_district_idx on public.tuitions (district);
create index if not exists tuitions_status_idx on public.tuitions (status);
create index if not exists tuitions_created_at_idx on public.tuitions (created_at desc);
create index if not exists tuitions_days_idx on public.tuitions using gin (preferred_days);

-- ============================================================================
-- tuition_requests — Student/Guardian → Teacher
-- ============================================================================
create table if not exists public.tuition_requests (
  id uuid primary key default gen_random_uuid(),
  tuition_id uuid not null references public.tuitions (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid references public.profiles (id) on delete set null,
  message text,
  status public.request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  responded_at timestamptz
);

create index if not exists tuition_requests_tuition_idx on public.tuition_requests (tuition_id);
create index if not exists tuition_requests_sender_idx on public.tuition_requests (sender_id);
create index if not exists tuition_requests_teacher_idx on public.tuition_requests (teacher_id);
create index if not exists tuition_requests_status_idx on public.tuition_requests (status);

-- Duplicate active request prevent
create unique index if not exists tuition_requests_active_unique
  on public.tuition_requests (tuition_id, teacher_id, sender_id)
  where status in ('pending', 'accepted');

-- ============================================================================
-- favorites — save teacher / save tuition
-- ============================================================================
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  teacher_id uuid references public.profiles (id) on delete cascade,
  tuition_id uuid references public.tuitions (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favorites_teacher_unique unique (user_id, teacher_id),
  constraint favorites_tuition_unique unique (user_id, tuition_id),
  constraint favorites_one_target check (
    (teacher_id is not null and tuition_id is null) or
    (teacher_id is null and tuition_id is not null)
  )
);

create index if not exists favorites_user_idx on public.favorites (user_id);

-- ============================================================================
-- notifications — lightweight in-app
-- ============================================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create index if not exists notifications_unread_idx on public.notifications (user_id) where read = false;

-- ============================================================================
-- Location helpers — দূরত্ব (কাছে/দূরে) হিসাব
-- ============================================================================

-- Haversine distance (km) between two lat/lng points
create or replace function public.distance_km(
  lat1 double precision, lon1 double precision,
  lat2 double precision, lon2 double precision
)
returns double precision
language sql
immutable
as $$
  select 6371 * 2 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) *
    power(sin(radians(lon2 - lon1) / 2), 2)
  ));
$$;

-- Proximity score (0-15) based on distance OR area/district fallback
create or replace function public.proximity_score(
  p_area text, p_district text, p_lat double precision, p_lon double precision,
  t_area text, t_district text, t_lat double precision, t_lon double precision,
  p_mode text, t_mode text
)
returns int
language plpgsql
immutable
as $$
declare
  d double precision;
begin
  -- Online হলে distance প্রযোজ্য নয় → full marks
  if p_mode = 'online' or t_mode = 'online' then
    return 15;
  end if;

  -- GPS আছে → exact distance
  if p_lat is not null and p_lon is not null and t_lat is not null and t_lon is not null then
    d := public.distance_km(p_lat, p_lon, t_lat, t_lon);
    if d <= 2 then return 15;
    elsif d <= 5 then return 12;
    elsif d <= 10 then return 8;
    elsif d <= 15 then return 5;
    else return 0;
    end if;
  end if;

  -- GPS নেই → area/district text fallback
  if p_area is not null and t_area is not null and lower(p_area) = lower(t_area) then
    return 15;   -- একই এলাকা (সবচেয়ে কাছে)
  elsif p_district is not null and t_district is not null and lower(p_district) = lower(t_district) then
    return 10;   -- একই জেলা
  else
    return 0;    -- অন্য জেলা / দূরে
  end if;
end;
$$;

-- Distance display (km) — জিপিএস থাকলে exact, না থাকলে null (UI-তে "Same area/district" দেখাবে)
create or replace function public.distance_between(
  lat1 double precision, lon1 double precision,
  lat2 double precision, lon2 double precision
)
returns double precision
language sql
immutable
as $$
  select case
    when lat1 is null or lon1 is null or lat2 is null or lon2 is null then null
    else public.distance_km(lat1, lon1, lat2, lon2)
  end;
$$;

-- ============================================================================
-- Rule-based matching score (max 100) — explainable, no AI
--   Subject 25 · Class 20 · Proximity 15 · Mode 10 · Budget 10 ·
--   Availability 5 · Experience 5 · Rating 5 · Verification 5
-- ============================================================================
create or replace function public.compute_match_score(
  p_teacher_id uuid,
  p_class text, p_subject text,
  p_district text, p_area text, p_lat double precision, p_lon double precision,
  p_mode text, p_budget numeric, p_days text[]
)
returns int
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  tp record;
  pr record;
  v_score int := 0;
begin
  select id, subjects, classes_taught, teaching_mode, experience_years,
         expected_salary, available_days, rating_avg
    into tp from public.teacher_profiles where id = p_teacher_id;

  select verification_status, area, district, latitude, longitude
    into pr from public.profiles where id = p_teacher_id;

  if tp.id is null then return 0; end if;

  -- Subject (25)
  if p_subject is not null and tp.subjects @> array[p_subject] then
    v_score := v_score + 25;
  end if;

  -- Class (20)
  if p_class is not null and tp.classes_taught @> array[p_class] then
    v_score := v_score + 20;
  end if;

  -- Proximity (15) — দূরত্ব
  v_score := v_score + public.proximity_score(
    p_area, p_district, p_lat, p_lon,
    pr.area, pr.district, pr.latitude, pr.longitude,
    p_mode, tp.teaching_mode
  );

  -- Mode (10)
  if p_mode is not null and (tp.teaching_mode = p_mode or tp.teaching_mode = 'both') then
    v_score := v_score + 10;
  end if;

  -- Budget (10)
  if p_budget is not null and tp.expected_salary is not null and tp.expected_salary <= p_budget then
    v_score := v_score + 10;
  end if;

  -- Availability (5)
  if p_days is not null and tp.available_days is not null and tp.available_days && p_days then
    v_score := v_score + 5;
  end if;

  -- Experience (5)
  if coalesce(tp.experience_years, 0) >= 2 then v_score := v_score + 5;
  elsif coalesce(tp.experience_years, 0) >= 1 then v_score := v_score + 3;
  end if;

  -- Rating (5)
  if coalesce(tp.rating_avg, 0) >= 4 then v_score := v_score + 5;
  elsif coalesce(tp.rating_avg, 0) >= 3 then v_score := v_score + 3;
  end if;

  -- Verification (5)
  if pr.verification_status = 'verified' then v_score := v_score + 5; end if;

  return v_score;
end;
$$;

-- ============================================================================
-- search_teachers — filter + distance sort + pagination
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
  p_sort text default 'relevance',   -- relevance | nearest | rating | experience | newest
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
    and (
      p_max_distance_km is null
      or p_lat is null or p_lon is null
      or p.latitude is null or p.longitude is null
      or public.distance_km(p_lat, p_lon, p.latitude, p.longitude) <= p_max_distance_km
    );

  select coalesce(json_agg(x), '[]'::json)
  into v_results
  from (
    select
      tp.id, p.full_name, p.display_name, p.avatar_url,
      p.district, p.area, p.gender, p.verification_status,
      tp.headline, tp.education, tp.subjects, tp.classes_taught,
      tp.experience_years, tp.teaching_mode, tp.teaching_area,
      tp.expected_salary, tp.available_days, tp.available_time, tp.bio,
      tp.rating_avg, tp.review_count,
      public.distance_between(p_lat, p_lon, p.latitude, p.longitude) as distance_km,
      public.proximity_score(
        p_area, p_district, p_lat, p_lon,
        p.area, p.district, p.latitude, p.longitude,
        p_mode, tp.teaching_mode
      ) as proximity
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
      and (
        p_max_distance_km is null
        or p_lat is null or p_lon is null
        or p.latitude is null or p.longitude is null
        or public.distance_km(p_lat, p_lon, p.latitude, p.longitude) <= p_max_distance_km
      )
    order by
      case when p_sort = 'nearest'
        then coalesce(public.distance_between(p_lat, p_lon, p.latitude, p.longitude), 999999) end asc,
      case when p_sort = 'rating' then coalesce(tp.rating_avg, 0) end desc,
      case when p_sort = 'experience' then coalesce(tp.experience_years, 0) end desc,
      case when p_sort = 'newest' then extract(epoch from tp.created_at) end desc,
      (p.verification_status = 'verified') desc,
      coalesce(tp.rating_avg, 0) desc,
      coalesce(tp.experience_years, 0) desc
    limit least(coalesce(p_page_size,12), 50) offset v_offset
  ) x;

  return json_build_object(
    'total', v_total,
    'page', greatest(coalesce(p_page,1), 1),
    'page_size', least(coalesce(p_page_size,12), 50),
    'results', v_results
  );
end;
$$;

-- ============================================================================
-- search_tuitions — filter + pagination
-- ============================================================================
create or replace function public.search_tuitions(
  p_class text default null,
  p_subject text default null,
  p_district text default null,
  p_area text default null,
  p_min_budget numeric default null,
  p_max_budget numeric default null,
  p_mode text default null,
  p_day text default null,
  p_time text default null,
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
  from public.tuitions t
  join public.profiles po on po.id = t.poster_id
  where (p_class is null or t.class_level = p_class)
    and (p_subject is null or t.subject = p_subject)
    and (p_district is null or lower(coalesce(t.district,'')) = lower(p_district))
    and (p_area is null or lower(coalesce(t.area,'')) = lower(p_area))
    and (p_min_budget is null or coalesce(t.budget,0) >= p_min_budget)
    and (p_max_budget is null or coalesce(t.budget,0) <= p_max_budget)
    and (p_mode is null or t.teaching_mode = p_mode or t.teaching_mode = 'both')
    and (p_day is null or t.preferred_days @> array[p_day])
    and (p_time is null or coalesce(t.preferred_time,'') ilike '%' || p_time || '%');

  select coalesce(json_agg(x order by x.created_at desc), '[]'::json)
  into v_results
  from (
    select
      t.id, t.title, t.class_level, t.subject, t.district, t.area,
      t.budget, t.budget_negotiable, t.teaching_mode,
      t.preferred_days, t.preferred_time, t.requirements, t.status, t.created_at,
      t.poster_id,
      po.full_name as poster_name, po.display_name as poster_display_name,
      po.role as poster_role, po.avatar_url as poster_avatar
    from public.tuitions t
    join public.profiles po on po.id = t.poster_id
    where (p_class is null or t.class_level = p_class)
      and (p_subject is null or t.subject = p_subject)
      and (p_district is null or lower(coalesce(t.district,'')) = lower(p_district))
      and (p_area is null or lower(coalesce(t.area,'')) = lower(p_area))
      and (p_min_budget is null or coalesce(t.budget,0) >= p_min_budget)
      and (p_max_budget is null or coalesce(t.budget,0) <= p_max_budget)
      and (p_mode is null or t.teaching_mode = p_mode or t.teaching_mode = 'both')
      and (p_day is null or t.preferred_days @> array[p_day])
      and (p_time is null or coalesce(t.preferred_time,'') ilike '%' || p_time || '%')
    limit least(coalesce(p_page_size,12), 50) offset v_offset
  ) x;

  return json_build_object(
    'total', v_total,
    'page', greatest(coalesce(p_page,1), 1),
    'page_size', least(coalesce(p_page_size,12), 50),
    'results', v_results
  );
end;
$$;

-- ============================================================================
-- match_teachers_for_tuition — tuition-এর জন্য best-match teacher list
-- ============================================================================
create or replace function public.match_teachers_for_tuition(
  p_tuition_id uuid,
  p_limit int default 10
)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  t public.tuitions%rowtype;
  v_total int;
  v_results json;
begin
  select * into t from public.tuitions where id = p_tuition_id;
  if t.id is null then
    return json_build_object('total', 0, 'results', '[]'::json);
  end if;

  select count(*) into v_total
  from public.teacher_profiles tp
  join public.profiles p on p.id = tp.id
  where p.role = 'teacher' and p.account_status = 'active'
    and public.compute_match_score(tp.id, t.class_level, t.subject,
        t.district, t.area, t.latitude, t.longitude,
        t.teaching_mode, t.budget, t.preferred_days) >= 40;

  select coalesce(json_agg(x order by x.score desc), '[]'::json)
  into v_results
  from (
    select
      tp.id, p.full_name, p.display_name, p.avatar_url,
      p.district, p.area,
      tp.headline, tp.subjects, tp.classes_taught, tp.experience_years,
      tp.teaching_mode, tp.expected_salary, tp.rating_avg, tp.review_count,
      public.compute_match_score(tp.id, t.class_level, t.subject,
        t.district, t.area, t.latitude, t.longitude,
        t.teaching_mode, t.budget, t.preferred_days) as score,
      public.distance_between(t.latitude, t.longitude, p.latitude, p.longitude) as distance_km
    from public.teacher_profiles tp
    join public.profiles p on p.id = tp.id
    where p.role = 'teacher' and p.account_status = 'active'
      and public.compute_match_score(tp.id, t.class_level, t.subject,
        t.district, t.area, t.latitude, t.longitude,
        t.teaching_mode, t.budget, t.preferred_days) >= 40
    limit least(coalesce(p_limit,10), 50)
  ) x;

  return json_build_object('total', v_total, 'results', v_results);
end;
$$;

-- ============================================================================
-- Triggers — notification + validation
-- ============================================================================
drop trigger if exists tuitions_set_updated_at on public.tuitions;
create trigger tuitions_set_updated_at before update on public.tuitions
  for each row execute function public.set_updated_at();

drop trigger if exists tuition_requests_set_updated_at on public.tuition_requests;
create trigger tuition_requests_set_updated_at before update on public.tuition_requests
  for each row execute function public.set_updated_at();

-- request validation: শুধু student/guardian → teacher
create or replace function public.validate_tuition_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = new.teacher_id and role = 'teacher') then
    raise exception 'Tuition requests can only be sent to teachers.';
  end if;
  if not exists (select 1 from public.profiles where id = new.sender_id and role in ('student','guardian')) then
    raise exception 'Only students or guardians can send tuition requests.';
  end if;
  return new;
end;
$$;

drop trigger if exists tuition_requests_validate on public.tuition_requests;
create trigger tuition_requests_validate before insert on public.tuition_requests
  for each row execute function public.validate_tuition_request();

-- status transition
create or replace function public.check_request_status_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status = 'pending' and new.status in ('accepted','rejected','withdrawn') then
    new.responded_at := now();
    return new;
  end if;
  raise exception 'Invalid tuition request status transition.';
end;
$$;

drop trigger if exists tuition_requests_status_transition on public.tuition_requests;
create trigger tuition_requests_status_transition before update of status on public.tuition_requests
  for each row execute function public.check_request_status_transition();

-- notification: new request → teacher
create or replace function public.notify_new_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'pending' then
    insert into public.notifications (user_id, type, title, body, link)
    values (new.teacher_id, 'new_request', 'নতুন tuition request',
            'আপনি একটি নতুন tuition request পেয়েছেন।', '/dashboard/requests');
  end if;
  return new;
end;
$$;

drop trigger if exists tuition_requests_notify_new on public.tuition_requests;
create trigger tuition_requests_notify_new after insert on public.tuition_requests
  for each row execute function public.notify_new_request();

-- notification: accepted/rejected → sender + tuition auto-assign
create or replace function public.notify_request_response()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    if new.status = 'accepted' then
      insert into public.notifications (user_id, type, title, body, link)
      values (new.sender_id, 'request_accepted', 'Request accepted',
              'একজন শিক্ষক আপনার tuition request accept করেছেন।', '/dashboard/requests');
      update public.tuitions set status = 'assigned'
        where id = new.tuition_id and status = 'open';
    elsif new.status = 'rejected' then
      insert into public.notifications (user_id, type, title, body, link)
      values (new.sender_id, 'request_rejected', 'Request rejected',
              'একজন শিক্ষক আপনার tuition request reject করেছেন।', '/dashboard/requests');
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists tuition_requests_notify_response on public.tuition_requests;
create trigger tuition_requests_notify_response after update of status on public.tuition_requests
  for each row execute function public.notify_request_response();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.tuitions enable row level security;
alter table public.tuition_requests enable row level security;
alter table public.favorites enable row level security;
alter table public.notifications enable row level security;

-- tuitions -------------------------------------------------------------------
drop policy if exists "tuitions_select_authenticated" on public.tuitions;
create policy "tuitions_select_authenticated" on public.tuitions
  for select to authenticated using (true);

drop policy if exists "tuitions_insert_own" on public.tuitions;
create policy "tuitions_insert_own" on public.tuitions
  for insert to authenticated with check (auth.uid() = poster_id);

drop policy if exists "tuitions_update_own" on public.tuitions;
create policy "tuitions_update_own" on public.tuitions
  for update to authenticated
  using (auth.uid() = poster_id or public.is_admin())
  with check (auth.uid() = poster_id or public.is_admin());

drop policy if exists "tuitions_delete_own" on public.tuitions;
create policy "tuitions_delete_own" on public.tuitions
  for delete to authenticated using (auth.uid() = poster_id or public.is_admin());

-- tuition_requests -----------------------------------------------------------
drop policy if exists "tuition_requests_select_involved" on public.tuition_requests;
create policy "tuition_requests_select_involved" on public.tuition_requests
  for select to authenticated
  using (auth.uid() = sender_id or auth.uid() = teacher_id
         or (student_id is not null and auth.uid() = student_id)
         or public.is_admin());

drop policy if exists "tuition_requests_insert_own" on public.tuition_requests;
create policy "tuition_requests_insert_own" on public.tuition_requests
  for insert to authenticated with check (auth.uid() = sender_id);

drop policy if exists "tuition_requests_update_involved" on public.tuition_requests;
create policy "tuition_requests_update_involved" on public.tuition_requests
  for update to authenticated
  using (auth.uid() = sender_id or auth.uid() = teacher_id or public.is_admin())
  with check (auth.uid() = sender_id or auth.uid() = teacher_id or public.is_admin());

drop policy if exists "tuition_requests_delete_admin" on public.tuition_requests;
create policy "tuition_requests_delete_admin" on public.tuition_requests
  for delete to authenticated using (public.is_admin());

-- favorites ------------------------------------------------------------------
drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own" on public.favorites
  for select to authenticated using (auth.uid() = user_id or public.is_admin());

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own" on public.favorites
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own" on public.favorites
  for delete to authenticated using (auth.uid() = user_id or public.is_admin());

-- notifications --------------------------------------------------------------
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select to authenticated using (auth.uid() = user_id or public.is_admin());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update to authenticated
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- ============================================================================
-- Privileges
-- ============================================================================
grant select, insert, update, delete on public.tuitions to authenticated;
grant select, insert, update, delete on public.tuition_requests to authenticated;
grant select, insert, delete on public.favorites to authenticated;
grant select, update on public.notifications to authenticated;

grant usage on type public.tuition_status to authenticated;
grant usage on type public.request_status to authenticated;

revoke all on function public.search_teachers(text, text, text, text, double precision, double precision, double precision, text, text, int, numeric, boolean, text, int, int) from public;
revoke all on function public.search_tuitions(text, text, text, text, numeric, numeric, text, text, text, int, int) from public;
revoke all on function public.match_teachers_for_tuition(uuid, int) from public;
revoke all on function public.distance_between(double precision, double precision, double precision, double precision) from public;

grant execute on function public.search_teachers(text, text, text, text, double precision, double precision, double precision, text, text, int, numeric, boolean, text, int, int) to anon, authenticated;
grant execute on function public.search_tuitions(text, text, text, text, numeric, numeric, text, text, text, int, int) to authenticated;
grant execute on function public.match_teachers_for_tuition(uuid, int) to authenticated;
grant execute on function public.distance_between(double precision, double precision, double precision, double precision) to authenticated;
