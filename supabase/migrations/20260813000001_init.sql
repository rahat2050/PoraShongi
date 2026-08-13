-- ============================================================================
-- PoraShongi — Phase 1 Foundation: initial database schema
-- ----------------------------------------------------------------------------
-- Creates:
--   * enums (user_role, account_status, verification_status)
--   * profiles               — one row per auth user (base profile)
--   * student_profiles       — role-specific (1:1 with profiles)
--   * teacher_profiles       — role-specific (1:1 with profiles)
--   * guardian_profiles      — role-specific (1:1 with profiles)
--   * triggers               — auto-create profiles, role profiles, updated_at
--   * helpers                — is_admin(), role-change protection
--   * Row Level Security     — own-data-only + admin access
-- ----------------------------------------------------------------------------
-- Idempotent: safe to re-run. Run via the Supabase SQL editor or
-- `supabase db push`.
-- ============================================================================

-- Extensions ---------------------------------------------------------------
create extension if not exists pgcrypto;

-- Enums ---------------------------------------------------------------------
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

-- Tables --------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'student',
  full_name text,
  display_name text,
  avatar_url text,
  location text,
  account_status public.account_status not null default 'active',
  verification_status public.verification_status not null default 'unverified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_avatar_url_maxlen check (char_length(coalesce(avatar_url, '')) <= 2000)
);

comment on table public.profiles is 'Base profile — one row per authenticated user.';
comment on column public.profiles.avatar_url is 'Cloudinary image URL reference (optimized on delivery).';

create table if not exists public.student_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  grade text,
  institution text,
  subjects_of_interest text[],
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teacher_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  headline text,
  bio text,
  subjects text[],
  qualifications text[],
  experience_years smallint check (experience_years between 0 and 80),
  expected_salary text,
  availability text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.guardian_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  relationship_to_student text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes -------------------------------------------------------------------
create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_location_idx on public.profiles (location);
create index if not exists profiles_created_at_idx on public.profiles (created_at desc);
create index if not exists teacher_profiles_subjects_idx on public.teacher_profiles using gin (subjects);
create index if not exists student_profiles_subjects_idx on public.student_profiles using gin (subjects_of_interest);

-- updated_at trigger --------------------------------------------------------
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
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists student_profiles_set_updated_at on public.student_profiles;
create trigger student_profiles_set_updated_at
  before update on public.student_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists teacher_profiles_set_updated_at on public.teacher_profiles;
create trigger teacher_profiles_set_updated_at
  before update on public.teacher_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists guardian_profiles_set_updated_at on public.guardian_profiles;
create trigger guardian_profiles_set_updated_at
  before update on public.guardian_profiles
  for each row execute function public.set_updated_at();

-- is_admin() helper ---------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and account_status = 'active'
  );
$$;

-- handle_new_user: create a base profile on signup --------------------------
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

  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    new.email
  );

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

-- handle_profile_role: keep the role-specific profile in sync ----------------
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
    else
      null;
  end case;
  return new;
end;
$$;

drop trigger if exists on_profile_role_created on public.profiles;
create trigger on_profile_role_created
  after insert on public.profiles
  for each row execute function public.handle_profile_role();

-- prevent_role_change: users cannot change their own role --------------------
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
-- Row Level Security
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.teacher_profiles enable row level security;
alter table public.guardian_profiles enable row level security;

-- profiles ------------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_delete_admin" on public.profiles;
create policy "profiles_delete_admin" on public.profiles
  for delete to authenticated
  using (public.is_admin());

-- student_profiles ----------------------------------------------------------
drop policy if exists "student_profiles_select_own" on public.student_profiles;
create policy "student_profiles_select_own" on public.student_profiles
  for select to authenticated
  using (auth.uid() = id or public.is_admin());

drop policy if exists "student_profiles_insert_own" on public.student_profiles;
create policy "student_profiles_insert_own" on public.student_profiles
  for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists "student_profiles_update_own" on public.student_profiles;
create policy "student_profiles_update_own" on public.student_profiles
  for update to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

drop policy if exists "student_profiles_delete_admin" on public.student_profiles;
create policy "student_profiles_delete_admin" on public.student_profiles
  for delete to authenticated
  using (public.is_admin());

-- teacher_profiles ----------------------------------------------------------
drop policy if exists "teacher_profiles_select_own" on public.teacher_profiles;
create policy "teacher_profiles_select_own" on public.teacher_profiles
  for select to authenticated
  using (auth.uid() = id or public.is_admin());

drop policy if exists "teacher_profiles_insert_own" on public.teacher_profiles;
create policy "teacher_profiles_insert_own" on public.teacher_profiles
  for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists "teacher_profiles_update_own" on public.teacher_profiles;
create policy "teacher_profiles_update_own" on public.teacher_profiles
  for update to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

drop policy if exists "teacher_profiles_delete_admin" on public.teacher_profiles;
create policy "teacher_profiles_delete_admin" on public.teacher_profiles
  for delete to authenticated
  using (public.is_admin());

-- guardian_profiles ---------------------------------------------------------
drop policy if exists "guardian_profiles_select_own" on public.guardian_profiles;
create policy "guardian_profiles_select_own" on public.guardian_profiles
  for select to authenticated
  using (auth.uid() = id or public.is_admin());

drop policy if exists "guardian_profiles_insert_own" on public.guardian_profiles;
create policy "guardian_profiles_insert_own" on public.guardian_profiles
  for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists "guardian_profiles_update_own" on public.guardian_profiles;
create policy "guardian_profiles_update_own" on public.guardian_profiles
  for update to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

drop policy if exists "guardian_profiles_delete_admin" on public.guardian_profiles;
create policy "guardian_profiles_delete_admin" on public.guardian_profiles
  for delete to authenticated
  using (public.is_admin());

-- ============================================================================
-- Privileges — be explicit; unauthenticated (anon) gets no table access.
-- The `service_role` (used by the admin client, server-side only) bypasses
-- RLS and must never be exposed to the browser.
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
