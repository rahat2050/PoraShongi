-- Admin accountability, inactive-account enforcement helpers and hardened
-- SECURITY DEFINER RPCs.

-- ---------------------------------------------------------------------------
-- Role and admin-account protection
-- ---------------------------------------------------------------------------
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'User roles can only be changed by the service role.' using errcode = '42501';
  end if;

  if old.role = 'admin'
     and coalesce(auth.role(), '') <> 'service_role'
     and (
       old.account_status is distinct from new.account_status
       or old.verification_status is distinct from new.verification_status
       or old.is_premium is distinct from new.is_premium
     ) then
    raise exception 'Admin accounts cannot be moderated from a user session.' using errcode = '42501';
  end if;

  if old.account_status in ('suspended', 'pending')
     and old.account_status is distinct from new.account_status
     and coalesce(auth.role(), '') <> 'service_role'
     and not public.is_admin() then
    raise exception 'Only an admin can reactivate a suspended or pending account.' using errcode = '42501';
  end if;

  return new;
end;
$$;

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.account_status = 'active'
  );
$$;

revoke all on function public.is_active_user() from public;
grant execute on function public.is_active_user() to authenticated;

-- Inactive accounts retain read access to their account page but cannot mutate
-- marketplace, messaging or profile data directly through PostgREST.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((auth.uid() = id and public.is_active_user()) or public.is_admin())
  with check ((auth.uid() = id and public.is_active_user()) or public.is_admin());

drop policy if exists "student_profiles_update_own" on public.student_profiles;
create policy "student_profiles_update_own" on public.student_profiles
  for update to authenticated
  using ((auth.uid() = id and public.is_active_user()) or public.is_admin())
  with check ((auth.uid() = id and public.is_active_user()) or public.is_admin());

drop policy if exists "teacher_profiles_update_own" on public.teacher_profiles;
create policy "teacher_profiles_update_own" on public.teacher_profiles
  for update to authenticated
  using ((auth.uid() = id and public.is_active_user()) or public.is_admin())
  with check ((auth.uid() = id and public.is_active_user()) or public.is_admin());

drop policy if exists "guardian_profiles_update_own" on public.guardian_profiles;
create policy "guardian_profiles_update_own" on public.guardian_profiles
  for update to authenticated
  using ((auth.uid() = id and public.is_active_user()) or public.is_admin())
  with check ((auth.uid() = id and public.is_active_user()) or public.is_admin());

drop policy if exists "tuitions_update_own" on public.tuitions;
create policy "tuitions_update_own" on public.tuitions
  for update to authenticated
  using ((auth.uid() = poster_id and public.is_active_user()) or public.is_admin())
  with check ((auth.uid() = poster_id and public.is_active_user()) or public.is_admin());

drop policy if exists "tuitions_delete_own" on public.tuitions;
create policy "tuitions_delete_own" on public.tuitions
  for delete to authenticated
  using ((auth.uid() = poster_id and public.is_active_user()) or public.is_admin());

drop policy if exists "tuition_requests_update_involved" on public.tuition_requests;
create policy "tuition_requests_update_involved" on public.tuition_requests
  for update to authenticated
  using (
    ((auth.uid() = sender_id or auth.uid() = teacher_id) and public.is_active_user())
    or public.is_admin()
  )
  with check (
    ((auth.uid() = sender_id or auth.uid() = teacher_id) and public.is_active_user())
    or public.is_admin()
  );

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own" on public.favorites
  for insert to authenticated
  with check (auth.uid() = user_id and public.is_active_user());

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own" on public.favorites
  for delete to authenticated
  using ((auth.uid() = user_id and public.is_active_user()) or public.is_admin());

drop policy if exists "conversations_insert_own" on public.conversations;
create policy "conversations_insert_own" on public.conversations
  for insert to authenticated
  with check (auth.uid() in (participant_a, participant_b) and public.is_active_user());

drop policy if exists "messages_insert_participant" on public.messages;
create policy "messages_insert_participant" on public.messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and public.is_active_user()
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and auth.uid() in (c.participant_a, c.participant_b)
    )
  );

drop policy if exists "messages_update_participant" on public.messages;
create policy "messages_update_participant" on public.messages
  for update to authenticated
  using (
    public.is_active_user()
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and auth.uid() in (c.participant_a, c.participant_b)
    )
  )
  with check (
    public.is_active_user()
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and auth.uid() in (c.participant_a, c.participant_b)
    )
  );

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews
  for insert to authenticated
  with check (reviewer_id = auth.uid() and public.is_active_user());

drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own" on public.reports
  for insert to authenticated
  with check (reporter_id = auth.uid() and public.is_active_user());

drop policy if exists "blocks_insert_own" on public.blocks;
create policy "blocks_insert_own" on public.blocks
  for insert to authenticated
  with check (blocker_id = auth.uid() and public.is_active_user());

drop policy if exists "blocks_delete_own" on public.blocks;
create policy "blocks_delete_own" on public.blocks
  for delete to authenticated
  using ((blocker_id = auth.uid() and public.is_active_user()) or public.is_admin());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update to authenticated
  using ((user_id = auth.uid() and public.is_active_user()) or public.is_admin())
  with check ((user_id = auth.uid() and public.is_active_user()) or public.is_admin());

-- ---------------------------------------------------------------------------
-- Admin audit log
-- ---------------------------------------------------------------------------
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles (id) on delete restrict,
  action text not null check (char_length(action) between 3 and 80),
  target_type text not null check (char_length(target_type) between 3 and 40),
  target_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_idx
  on public.admin_audit_log (created_at desc);
create index if not exists admin_audit_log_admin_idx
  on public.admin_audit_log (admin_id, created_at desc);

alter table public.admin_audit_log enable row level security;

drop policy if exists "admin_audit_select_admin" on public.admin_audit_log;
create policy "admin_audit_select_admin" on public.admin_audit_log
  for select to authenticated using (public.is_admin());

drop policy if exists "admin_audit_insert_admin" on public.admin_audit_log;
create policy "admin_audit_insert_admin" on public.admin_audit_log
  for insert to authenticated
  with check (public.is_admin() and admin_id = auth.uid());

grant select, insert on public.admin_audit_log to authenticated;
revoke update, delete on public.admin_audit_log from authenticated;

create or replace function public.log_admin_profile_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() and (
    old.account_status is distinct from new.account_status
    or old.verification_status is distinct from new.verification_status
    or old.is_premium is distinct from new.is_premium
    or old.premium_until is distinct from new.premium_until
  ) then
    insert into public.admin_audit_log (admin_id, action, target_type, target_id, details)
    values (
      auth.uid(),
      'profile_moderation',
      'profile',
      new.id,
      jsonb_build_object(
        'account_status_from', old.account_status,
        'account_status_to', new.account_status,
        'verification_from', old.verification_status,
        'verification_to', new.verification_status,
        'premium_from', old.is_premium,
        'premium_to', new.is_premium
      )
    );
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_admin_audit on public.profiles;
create trigger profiles_admin_audit
  after update on public.profiles
  for each row execute function public.log_admin_profile_change();

create or replace function public.log_admin_report_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() and old.status is distinct from new.status then
    insert into public.admin_audit_log (admin_id, action, target_type, target_id, details)
    values (
      auth.uid(),
      'report_moderation',
      'report',
      new.id,
      jsonb_build_object('status_from', old.status, 'status_to', new.status)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists reports_admin_audit on public.reports;
create trigger reports_admin_audit
  after update on public.reports
  for each row execute function public.log_admin_report_change();

-- ---------------------------------------------------------------------------
-- Harden SECURITY DEFINER functions
-- ---------------------------------------------------------------------------
create or replace function public.pending_request_count(p_user_id uuid)
returns int
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or (auth.uid() <> p_user_id and not public.is_admin()) then
    raise exception 'Not authorized to view this request count.' using errcode = '42501';
  end if;

  return (
    select count(*)::int
    from public.tuition_requests
    where sender_id = p_user_id and status = 'pending'
  );
end;
$$;

create or replace function public.cleanup_old_notifications(p_days int default 30)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted int;
  v_days int := greatest(7, least(coalesce(p_days, 30), 365));
begin
  if coalesce(auth.role(), '') <> 'service_role' and not public.is_admin() then
    raise exception 'Only an admin or service role can clean notifications.' using errcode = '42501';
  end if;

  delete from public.notifications
  where read = true and created_at < now() - make_interval(days => v_days);
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.cleanup_old_notifications(int) from public;
grant execute on function public.cleanup_old_notifications(int) to authenticated, service_role;

create or replace function public.get_teacher_own_reviews(p_teacher_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() <> p_teacher_id and not public.is_admin() then
    raise exception 'Not authorized to view private review moderation data.' using errcode = '42501';
  end if;

  return (
    select coalesce(json_agg(x order by x.created_at desc), '[]'::json)
    from (
      select r.id, r.rating, r.body, r.verified, r.status, r.created_at,
        p.full_name as reviewer_name,
        p.display_name as reviewer_display_name,
        p.avatar_url as reviewer_avatar
      from public.reviews r
      join public.profiles p on p.id = r.reviewer_id
      where r.teacher_id = p_teacher_id
    ) x
  );
end;
$$;

-- Only guardians/admins may discover students who explicitly allowed guardian
-- linking. Minor location remains hidden.
create or replace function public.list_students()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  select role::text into v_role from public.profiles where id = auth.uid();
  if v_role <> 'guardian' and not public.is_admin() then
    raise exception 'Only guardians can list linkable students.' using errcode = '42501';
  end if;

  return (
    select coalesce(json_agg(x order by x.full_name asc), '[]'::json)
    from (
      select p.id, p.full_name, p.display_name,
        case when p.is_minor then null else p.district end as district,
        case when p.is_minor then null else p.area end as area
      from public.profiles p
      where p.role = 'student'
        and p.account_status = 'active'
        and p.guardian_consent = true
    ) x
  );
end;
$$;

create or replace function public.match_tuitions_for_teacher_rpc(
  p_teacher_id uuid,
  p_limit int default 10
)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() <> p_teacher_id and not public.is_admin() then
    raise exception 'Not authorized to match for another teacher.' using errcode = '42501';
  end if;
  return public.match_tuitions_for_teacher(p_teacher_id, least(greatest(coalesce(p_limit, 10), 1), 20));
end;
$$;

-- Saved/fetched teacher cards must obey the same publication threshold as the
-- public directory.
create or replace function public.get_public_teachers(p_ids uuid[])
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(json_agg(x order by x.full_name asc), '[]'::json)
  from (
    select
      tp.id, p.full_name, p.display_name, p.avatar_url, p.gender,
      p.district, p.area, p.verification_status,
      tp.headline, tp.education, tp.subjects, tp.classes_taught,
      tp.experience_years, tp.teaching_mode, tp.expected_salary,
      tp.available_days, tp.bio, tp.rating_avg, tp.review_count
    from public.teacher_profiles tp
    join public.profiles p on p.id = tp.id
    where tp.id = any (p_ids)
      and public.is_teacher_profile_publishable(tp.id)
  ) x;
$$;

-- Admin-only aggregate analytics.
create or replace function public.admin_analytics()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_users bigint;
  v_teachers bigint;
  v_students bigint;
  v_guardians bigint;
  v_tuitions bigint;
  v_open_tuitions bigint;
  v_requests bigint;
  v_accepted bigint;
  v_reviews bigint;
  v_top_subjects json;
  v_top_districts json;
begin
  if not public.is_admin() then
    raise exception 'Admin access required.' using errcode = '42501';
  end if;

  select count(*) into v_users from public.profiles;
  select count(*) into v_teachers from public.profiles where role = 'teacher';
  select count(*) into v_students from public.profiles where role = 'student';
  select count(*) into v_guardians from public.profiles where role = 'guardian';
  select count(*) into v_tuitions from public.tuitions;
  select count(*) into v_open_tuitions from public.tuitions where status = 'open';
  select count(*) into v_requests from public.tuition_requests;
  select count(*) into v_accepted from public.tuition_requests where status = 'accepted';
  select count(*) into v_reviews from public.reviews where status = 'published';

  select coalesce(json_agg(x), '[]'::json) into v_top_subjects
  from (
    select subject, count(*) as c
    from public.tuitions
    group by subject
    order by c desc
    limit 5
  ) x;

  select coalesce(json_agg(x), '[]'::json) into v_top_districts
  from (
    select district, count(*) as c
    from public.profiles
    where district is not null
    group by district
    order by c desc
    limit 5
  ) x;

  return json_build_object(
    'users', v_users,
    'teachers', v_teachers,
    'students', v_students,
    'guardians', v_guardians,
    'tuitions', v_tuitions,
    'open_tuitions', v_open_tuitions,
    'requests', v_requests,
    'accepted', v_accepted,
    'reviews', v_reviews,
    'match_rate', case when v_requests > 0 then round(100.0 * v_accepted / v_requests, 1) else 0 end,
    'top_subjects', v_top_subjects,
    'top_districts', v_top_districts
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Contact-request ownership and transition integrity
-- ---------------------------------------------------------------------------
create or replace function public.validate_contact_request_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = new.sender_id
      and p.role in ('student', 'guardian')
      and p.account_status = 'active'
  ) then
    raise exception 'Only active students or guardians can request contact.';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = new.teacher_id
      and p.role = 'teacher'
      and p.account_status = 'active'
  ) or not public.is_teacher_profile_publishable(new.teacher_id) then
    raise exception 'The selected teacher is not available.';
  end if;

  if new.sender_id = new.teacher_id then
    raise exception 'You cannot request yourself.';
  end if;

  if exists (
    select 1 from public.blocks b
    where (b.blocker_id = new.sender_id and b.blocked_id = new.teacher_id)
       or (b.blocker_id = new.teacher_id and b.blocked_id = new.sender_id)
  ) then
    raise exception 'This contact request is not allowed.';
  end if;

  new.status := 'pending';
  return new;
end;
$$;

drop trigger if exists contact_requests_validate_insert on public.contact_requests;
create trigger contact_requests_validate_insert
  before insert on public.contact_requests
  for each row execute function public.validate_contact_request_insert();

create or replace function public.validate_contact_request_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.id is distinct from old.id
     or new.sender_id is distinct from old.sender_id
     or new.teacher_id is distinct from old.teacher_id
     or new.created_at is distinct from old.created_at then
    raise exception 'Contact request ownership is immutable.';
  end if;

  if old.status <> 'pending' or new.status not in ('accepted', 'rejected') then
    raise exception 'Invalid contact request transition.';
  end if;

  if auth.uid() <> old.teacher_id and not public.is_admin() then
    raise exception 'Only the selected teacher can answer this request.';
  end if;

  return new;
end;
$$;

drop trigger if exists contact_requests_validate_update on public.contact_requests;
create trigger contact_requests_validate_update
  before update on public.contact_requests
  for each row execute function public.validate_contact_request_update();

drop policy if exists "contact_requests_insert_own" on public.contact_requests;
create policy "contact_requests_insert_own" on public.contact_requests
  for insert to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('student', 'guardian')
        and p.account_status = 'active'
    )
  );

drop policy if exists "contact_requests_update_teacher" on public.contact_requests;
create policy "contact_requests_update_teacher" on public.contact_requests
  for update to authenticated
  using ((auth.uid() = teacher_id and public.is_active_user()) or public.is_admin())
  with check ((auth.uid() = teacher_id and public.is_active_user()) or public.is_admin());

-- Session mutation also stops immediately when a teacher is suspended.
drop policy if exists "sessions_insert_teacher" on public.sessions;
create policy "sessions_insert_teacher" on public.sessions
  for insert to authenticated
  with check (
    public.is_admin()
    or (
      auth.uid() = teacher_id
      and public.is_active_user()
      and exists (
        select 1 from public.tuition_requests r
        where r.tuition_id = sessions.tuition_id
          and r.teacher_id = auth.uid()
          and r.status = 'accepted'
      )
    )
  );

drop policy if exists "sessions_update_teacher" on public.sessions;
create policy "sessions_update_teacher" on public.sessions
  for update to authenticated
  using (
    public.is_admin()
    or (
      auth.uid() = teacher_id
      and public.is_active_user()
      and exists (
        select 1 from public.tuition_requests r
        where r.tuition_id = sessions.tuition_id
          and r.teacher_id = auth.uid()
          and r.status = 'accepted'
      )
    )
  )
  with check (
    public.is_admin()
    or (
      auth.uid() = teacher_id
      and public.is_active_user()
      and exists (
        select 1 from public.tuition_requests r
        where r.tuition_id = sessions.tuition_id
          and r.teacher_id = auth.uid()
          and r.status = 'accepted'
      )
    )
  );

drop policy if exists "sessions_delete_teacher" on public.sessions;
create policy "sessions_delete_teacher" on public.sessions
  for delete to authenticated
  using (
    public.is_admin()
    or (
      auth.uid() = teacher_id
      and public.is_active_user()
      and exists (
        select 1 from public.tuition_requests r
        where r.tuition_id = sessions.tuition_id
          and r.teacher_id = auth.uid()
          and r.status = 'accepted'
      )
    )
  );

-- Guardian linking requires explicit, revocable student consent.
create or replace function public.validate_guardian_student_link()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.linked_student_id is not null and not exists (
    select 1 from public.profiles p
    where p.id = new.linked_student_id
      and p.role = 'student'
      and p.account_status = 'active'
      and p.guardian_consent = true
  ) then
    raise exception 'The selected student has not allowed guardian linking.';
  end if;
  return new;
end;
$$;

drop trigger if exists guardian_profiles_validate_link on public.guardian_profiles;
create trigger guardian_profiles_validate_link
  before insert or update of linked_student_id on public.guardian_profiles
  for each row execute function public.validate_guardian_student_link();

create or replace function public.unlink_guardians_on_consent_revoke()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.guardian_consent = true and new.guardian_consent = false then
    update public.guardian_profiles
    set linked_student_id = null
    where linked_student_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_unlink_guardians on public.profiles;
create trigger profiles_unlink_guardians
  after update of guardian_consent on public.profiles
  for each row execute function public.unlink_guardians_on_consent_revoke();
