-- ============================================================================
-- PoraShongi — Phase 2 MVP Marketplace: database migration
-- ----------------------------------------------------------------------------
-- Extends the Phase 1 foundation:
--   * New columns on profiles / student / teacher / guardian profiles
--   * New tables: tuitions, tuition_requests, favorites, notifications
--   * Enums: tuition_status, request_status
--   * Triggers: updated_at, request validation, notifications, tuition status
--   * RPC search functions (public teacher directory, tuition search)
--   * Row Level Security for every new table
-- ----------------------------------------------------------------------------
-- Idempotent: safe to re-run.
-- ============================================================================

-- Enums ---------------------------------------------------------------------
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

-- profiles: contact + trust columns -----------------------------------------
alter table public.profiles
  add column if not exists phone text,
  add column if not exists phone_verified boolean not null default false;

-- student_profiles ----------------------------------------------------------
alter table public.student_profiles
  add column if not exists student_group text,
  add column if not exists teaching_mode_preference text,
  add column if not exists budget numeric,
  add column if not exists preferred_days text[],
  add column if not exists preferred_time text,
  add column if not exists profile_visibility text not null default 'public';

-- teacher_profiles ----------------------------------------------------------
alter table public.teacher_profiles
  add column if not exists education text,
  add column if not exists institution text,
  add column if not exists classes_taught text[],
  add column if not exists teaching_mode text,
  add column if not exists teaching_area text,
  add column if not exists available_days text[],
  add column if not exists available_time text;

-- Convert expected_salary from text to numeric (Phase 1 never shipped data).
alter table public.teacher_profiles
  alter column expected_salary type numeric
    using (case when expected_salary ~ '^[0-9]+\.?[0-9]*$' then expected_salary::numeric else null end);

-- Drop the now-redundant generic availability column (replaced by
-- available_days / available_time).
alter table public.teacher_profiles
  drop column if exists availability;

-- guardian_profiles ---------------------------------------------------------
alter table public.guardian_profiles
  add column if not exists contact_preference text,
  add column if not exists linked_student_id uuid references public.profiles (id) on delete set null;

create index if not exists guardian_profiles_linked_student_idx
  on public.guardian_profiles (linked_student_id);

-- ============================================================================
-- tuitions — tuition requirements / posts
-- ============================================================================
create table if not exists public.tuitions (
  id uuid primary key default gen_random_uuid(),
  poster_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid references public.profiles (id) on delete set null,
  title text not null check (char_length(title) between 3 and 140),
  class_level text not null,
  subject text not null,
  location text,
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

comment on table public.tuitions is 'Tuition requirements/posts created by students and guardians (teachers manage their own too).';
comment on column public.tuitions.student_id is 'The student this tuition is for (used when a guardian posts on behalf of a linked student).';

create index if not exists tuitions_poster_idx on public.tuitions (poster_id);
create index if not exists tuitions_student_idx on public.tuitions (student_id);
create index if not exists tuitions_class_idx on public.tuitions (class_level);
create index if not exists tuitions_subject_idx on public.tuitions (subject);
create index if not exists tuitions_location_idx on public.tuitions (location);
create index if not exists tuitions_status_idx on public.tuitions (status);
create index if not exists tuitions_created_at_idx on public.tuitions (created_at desc);
create index if not exists tuitions_days_idx on public.tuitions using gin (preferred_days);

-- ============================================================================
-- tuition_requests — student/guardian → teacher requests
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

comment on table public.tuition_requests is 'Tuition requests sent from a student/guardian to a teacher.';

create index if not exists tuition_requests_tuition_idx on public.tuition_requests (tuition_id);
create index if not exists tuition_requests_sender_idx on public.tuition_requests (sender_id);
create index if not exists tuition_requests_teacher_idx on public.tuition_requests (teacher_id);
create index if not exists tuition_requests_status_idx on public.tuition_requests (status);
create index if not exists tuition_requests_created_idx on public.tuition_requests (created_at desc);

-- Prevent duplicate ACTIVE requests for the same (tuition, teacher, sender).
create unique index if not exists tuition_requests_active_unique
  on public.tuition_requests (tuition_id, teacher_id, sender_id)
  where status in ('pending', 'accepted');

-- ============================================================================
-- favorites — students/guardians save teachers
-- ============================================================================
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favorites_unique unique (user_id, teacher_id)
);

create index if not exists favorites_user_idx on public.favorites (user_id);
create index if not exists favorites_teacher_idx on public.favorites (teacher_id);

-- ============================================================================
-- notifications — lightweight in-app notifications
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
-- updated_at triggers for new tables
-- ============================================================================
drop trigger if exists tuitions_set_updated_at on public.tuitions;
create trigger tuitions_set_updated_at
  before update on public.tuitions
  for each row execute function public.set_updated_at();

drop trigger if exists tuition_requests_set_updated_at on public.tuition_requests;
create trigger tuition_requests_set_updated_at
  before update on public.tuition_requests
  for each row execute function public.set_updated_at();

-- ============================================================================
-- validation triggers
-- ============================================================================
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
  if not exists (select 1 from public.profiles where id = new.sender_id and role in ('student', 'guardian')) then
    raise exception 'Only students or guardians can send tuition requests.';
  end if;
  return new;
end;
$$;

drop trigger if exists tuition_requests_validate on public.tuition_requests;
create trigger tuition_requests_validate
  before insert on public.tuition_requests
  for each row execute function public.validate_tuition_request();

create or replace function public.check_request_status_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status = 'pending' and new.status in ('accepted', 'rejected', 'withdrawn') then
    new.responded_at := now();
    return new;
  end if;
  raise exception 'Invalid tuition request status transition.';
end;
$$;

drop trigger if exists tuition_requests_status_transition on public.tuition_requests;
create trigger tuition_requests_status_transition
  before update of status on public.tuition_requests
  for each row execute function public.check_request_status_transition();

-- ============================================================================
-- notification triggers
-- ============================================================================
create or replace function public.notify_new_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'pending' then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      new.teacher_id,
      'new_request',
      'New tuition request',
      'You received a new tuition request.',
      '/dashboard/requests?tab=received'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists tuition_requests_notify_new on public.tuition_requests;
create trigger tuition_requests_notify_new
  after insert on public.tuition_requests
  for each row execute function public.notify_new_request();

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
              'A teacher accepted your tuition request.',
              '/dashboard/requests?tab=sent');
      update public.tuitions
         set status = 'assigned'
       where id = new.tuition_id and status = 'open';
    elsif new.status = 'rejected' then
      insert into public.notifications (user_id, type, title, body, link)
      values (new.sender_id, 'request_rejected', 'Request rejected',
              'A teacher declined your tuition request.',
              '/dashboard/requests?tab=sent');
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists tuition_requests_notify_response on public.tuition_requests;
create trigger tuition_requests_notify_response
  after update of status on public.tuition_requests
  for each row execute function public.notify_request_response();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.tuitions enable row level security;
alter table public.tuition_requests enable row level security;
alter table public.favorites enable row level security;
alter table public.notifications enable row level security;

-- tuitions ------------------------------------------------------------------
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
  for delete to authenticated
  using (auth.uid() = poster_id or public.is_admin());

-- tuition_requests ----------------------------------------------------------
drop policy if exists "tuition_requests_select_involved" on public.tuition_requests;
create policy "tuition_requests_select_involved" on public.tuition_requests
  for select to authenticated
  using (
    auth.uid() = sender_id
    or auth.uid() = teacher_id
    or (student_id is not null and auth.uid() = student_id)
    or public.is_admin()
  );

drop policy if exists "tuition_requests_insert_own" on public.tuition_requests;
create policy "tuition_requests_insert_own" on public.tuition_requests
  for insert to authenticated with check (auth.uid() = sender_id);

drop policy if exists "tuition_requests_update_involved" on public.tuition_requests;
create policy "tuition_requests_update_involved" on public.tuition_requests
  for update to authenticated
  using (
    auth.uid() = sender_id
    or auth.uid() = teacher_id
    or public.is_admin()
  )
  with check (
    auth.uid() = sender_id
    or auth.uid() = teacher_id
    or public.is_admin()
  );

drop policy if exists "tuition_requests_delete_admin" on public.tuition_requests;
create policy "tuition_requests_delete_admin" on public.tuition_requests
  for delete to authenticated using (public.is_admin());

-- favorites -----------------------------------------------------------------
drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own" on public.favorites
  for select to authenticated using (auth.uid() = user_id or public.is_admin());

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own" on public.favorites
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own" on public.favorites
  for delete to authenticated using (auth.uid() = user_id or public.is_admin());

-- notifications -------------------------------------------------------------
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select to authenticated using (auth.uid() = user_id or public.is_admin());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update to authenticated
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- ============================================================================
-- RPC search / public read functions (security definer — explicit field lists,
-- no sensitive data).
-- ============================================================================

-- Search teachers (public directory) ----------------------------------------
create or replace function public.search_teachers(
  p_class text default null,
  p_subject text default null,
  p_location text default null,
  p_min_experience int default null,
  p_mode text default null,
  p_verified boolean default null,
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
  v_offset int := greatest(coalesce(p_page, 1) - 1, 0) * least(coalesce(p_page_size, 12), 50);
  v_total bigint;
  v_results json;
begin
  select count(*) into v_total
  from public.teacher_profiles tp
  join public.profiles p on p.id = tp.id
  where p.role = 'teacher'
    and p.account_status = 'active'
    and (p_class is null or tp.classes_taught @> array[p_class])
    and (p_subject is null or tp.subjects @> array[p_subject])
    and (p_location is null or coalesce(p.location, '') ilike '%' || p_location || '%')
    and (p_min_experience is null or coalesce(tp.experience_years, 0) >= p_min_experience)
    and (p_mode is null or tp.teaching_mode = p_mode or tp.teaching_mode = 'both')
    and (p_verified is null or (p_verified = false) or (p_verified = true and p.verification_status = 'verified'));

  select coalesce(json_agg(t order by t.is_verified desc, t.experience_years desc nulls last), '[]'::json)
  into v_results
  from (
    select
      tp.id,
      p.full_name,
      p.display_name,
      p.avatar_url,
      p.location,
      p.verification_status,
      p.phone_verified,
      tp.headline,
      tp.education,
      tp.institution,
      tp.qualifications,
      tp.subjects,
      tp.classes_taught,
      tp.experience_years,
      tp.teaching_mode,
      tp.teaching_area,
      tp.expected_salary,
      tp.available_days,
      tp.available_time,
      tp.bio,
      (p.verification_status = 'verified') as is_verified,
      tp.created_at
    from public.teacher_profiles tp
    join public.profiles p on p.id = tp.id
    where p.role = 'teacher'
      and p.account_status = 'active'
      and (p_class is null or tp.classes_taught @> array[p_class])
      and (p_subject is null or tp.subjects @> array[p_subject])
      and (p_location is null or coalesce(p.location, '') ilike '%' || p_location || '%')
      and (p_min_experience is null or coalesce(tp.experience_years, 0) >= p_min_experience)
      and (p_mode is null or tp.teaching_mode = p_mode or tp.teaching_mode = 'both')
      and (p_verified is null or (p_verified = false) or (p_verified = true and p.verification_status = 'verified'))
    order by (p.verification_status = 'verified') desc, coalesce(tp.experience_years, 0) desc
    limit least(coalesce(p_page_size, 12), 50) offset v_offset
  ) t;

  return json_build_object(
    'total', v_total,
    'page', greatest(coalesce(p_page, 1), 1),
    'page_size', least(coalesce(p_page_size, 12), 50),
    'results', v_results
  );
end;
$$;

-- Public teacher profile -----------------------------------------------------
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
      tp.id,
      p.full_name,
      p.display_name,
      p.avatar_url,
      p.location,
      p.verification_status,
      p.phone_verified,
      tp.headline,
      tp.education,
      tp.institution,
      tp.qualifications,
      tp.subjects,
      tp.classes_taught,
      tp.experience_years,
      tp.teaching_mode,
      tp.teaching_area,
      tp.expected_salary,
      tp.available_days,
      tp.available_time,
      tp.bio,
      tp.created_at
    from public.teacher_profiles tp
    join public.profiles p on p.id = tp.id
    where tp.id = p_teacher_id
      and p.role = 'teacher'
      and p.account_status = 'active'
  ) t;
$$;

-- Public teacher summaries by ids (favorites / saved teachers) ---------------
create or replace function public.get_public_teachers(p_ids uuid[])
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(json_agg(t order by t.full_name asc), '[]'::json)
  from (
    select
      tp.id,
      p.full_name,
      p.display_name,
      p.avatar_url,
      p.location,
      p.verification_status,
      p.phone_verified,
      tp.headline,
      tp.education,
      tp.subjects,
      tp.classes_taught,
      tp.experience_years,
      tp.teaching_mode,
      tp.expected_salary,
      tp.available_days,
      tp.bio
    from public.teacher_profiles tp
    join public.profiles p on p.id = tp.id
    where tp.id = any (p_ids)
      and p.role = 'teacher'
      and p.account_status = 'active'
  ) t;
$$;

-- Search tuitions -----------------------------------------------------------
create or replace function public.search_tuitions(
  p_class text default null,
  p_subject text default null,
  p_location text default null,
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
  v_offset int := greatest(coalesce(p_page, 1) - 1, 0) * least(coalesce(p_page_size, 12), 50);
  v_total bigint;
  v_results json;
begin
  select count(*) into v_total
  from public.tuitions t
  join public.profiles po on po.id = t.poster_id
  where (p_class is null or t.class_level = p_class)
    and (p_subject is null or t.subject = p_subject)
    and (p_location is null or coalesce(t.location, '') ilike '%' || p_location || '%')
    and (p_min_budget is null or coalesce(t.budget, 0) >= p_min_budget)
    and (p_max_budget is null or coalesce(t.budget, 0) <= p_max_budget)
    and (p_mode is null or t.teaching_mode = p_mode or t.teaching_mode = 'both')
    and (p_day is null or t.preferred_days @> array[p_day])
    and (p_time is null or coalesce(t.preferred_time, '') ilike '%' || p_time || '%');

  select coalesce(json_agg(t order by t.created_at desc), '[]'::json)
  into v_results
  from (
    select
      t.id,
      t.title,
      t.class_level,
      t.subject,
      t.location,
      t.budget,
      t.budget_negotiable,
      t.teaching_mode,
      t.preferred_days,
      t.preferred_time,
      t.requirements,
      t.status,
      t.created_at,
      t.poster_id,
      po.full_name as poster_name,
      po.display_name as poster_display_name,
      po.role as poster_role,
      po.avatar_url as poster_avatar
    from public.tuitions t
    join public.profiles po on po.id = t.poster_id
    where (p_class is null or t.class_level = p_class)
      and (p_subject is null or t.subject = p_subject)
      and (p_location is null or coalesce(t.location, '') ilike '%' || p_location || '%')
      and (p_min_budget is null or coalesce(t.budget, 0) >= p_min_budget)
      and (p_max_budget is null or coalesce(t.budget, 0) <= p_max_budget)
      and (p_mode is null or t.teaching_mode = p_mode or t.teaching_mode = 'both')
      and (p_day is null or t.preferred_days @> array[p_day])
      and (p_time is null or coalesce(t.preferred_time, '') ilike '%' || p_time || '%')
    order by t.created_at desc
    limit least(coalesce(p_page_size, 12), 50) offset v_offset
  ) t;

  return json_build_object(
    'total', v_total,
    'page', greatest(coalesce(p_page, 1), 1),
    'page_size', least(coalesce(p_page_size, 12), 50),
    'results', v_results
  );
end;
$$;

-- Public tuition detail -----------------------------------------------------
create or replace function public.get_public_tuition(p_tuition_id uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(row_to_json(t)::json, 'null'::json)
  from (
    select
      t.id,
      t.title,
      t.class_level,
      t.subject,
      t.location,
      t.budget,
      t.budget_negotiable,
      t.teaching_mode,
      t.preferred_days,
      t.preferred_time,
      t.requirements,
      t.status,
      t.created_at,
      t.poster_id,
      t.student_id,
      po.full_name as poster_name,
      po.display_name as poster_display_name,
      po.role as poster_role,
      po.avatar_url as poster_avatar
    from public.tuitions t
    join public.profiles po on po.id = t.poster_id
    where t.id = p_tuition_id
  ) t;
$$;

-- Minimal public profile info by ids (names for requests/tuitions) ----------
create or replace function public.get_profiles_public(p_ids uuid[])
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(json_agg(t order by t.full_name asc), '[]'::json)
  from (
    select p.id, p.full_name, p.display_name, p.role, p.avatar_url, p.location
    from public.profiles p
    where p.id = any (p_ids)
  ) t;
$$;

-- Minimal student directory (guardian linking) ------------------------------
create or replace function public.list_students()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(json_agg(t order by t.full_name asc), '[]'::json)
  from (
    select p.id, p.full_name, p.display_name, p.location
    from public.profiles p
    where p.role = 'student' and p.account_status = 'active'
  ) t;
$$;

-- ============================================================================
-- Privileges
-- ============================================================================
grant select, insert, update, delete on public.tuitions to authenticated;
grant select, insert, update, delete on public.tuition_requests to authenticated;
grant select, insert, update, delete on public.favorites to authenticated;
grant select, update on public.notifications to authenticated;

grant usage on type public.tuition_status to authenticated;
grant usage on type public.request_status to authenticated;

-- Public directory functions (no sensitive fields exposed).
revoke all on function public.search_teachers(text, text, text, int, text, boolean, int, int) from public;
revoke all on function public.get_public_teacher(uuid) from public;
revoke all on function public.get_public_teachers(uuid[]) from public;
revoke all on function public.search_tuitions(text, text, text, numeric, numeric, text, text, text, int, int) from public;
revoke all on function public.get_public_tuition(uuid) from public;
revoke all on function public.list_students() from public;
revoke all on function public.get_profiles_public(uuid[]) from public;

grant execute on function public.search_teachers(text, text, text, int, text, boolean, int, int) to anon, authenticated;
grant execute on function public.get_public_teacher(uuid) to anon, authenticated;
grant execute on function public.get_public_teachers(uuid[]) to anon, authenticated;
grant execute on function public.search_tuitions(text, text, text, numeric, numeric, text, text, text, int, int) to authenticated;
grant execute on function public.get_public_tuition(uuid) to authenticated;
grant execute on function public.list_students() to authenticated;
grant execute on function public.get_profiles_public(uuid[]) to authenticated;

-- Realtime for in-app notifications (guarded — publication may not exist yet).
do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception when others then
  null;
end $$;
