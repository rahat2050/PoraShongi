-- ============================================================================
-- PoraSathi (পড়াসাথী) — 0030: Security & integrity hardening
-- ----------------------------------------------------------------------------
-- Fixes found in the full-project audit (BUG-REPORT.md):
--   1. meeting_link leaked to every authenticated user via search_tuitions
--      and via direct table select (tuitions RLS is `using (true)`).
--   2. tuition student_id leaked via get_public_tuition (child identity chain
--      with get_profiles_public).
--   3. Minor tuition posters' real names/avatars leaked via search_tuitions.
--   4. get_profiles_public returned full identity for minor students to any
--      authenticated caller (now relationship-scoped).
--   5. Reviewers could self-unhide / re-verify their own reviews through the
--      REST API (no before-update trigger on reviews).
--   6. admin_analytics() had no authorization guard.
--   7. Message retention cleanup ran a full-table DELETE on every message
--      insert (now bounded to the inserted conversation; pg_cron retained).
--   8. No server-side tuition status state machine / ownership immutability.
--   9. No rate limits on messages / conversation creation.
--  10. record_profile_view inflated by anonymous/bot traffic and own views.
--
-- Idempotent — safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. search_tuitions: drop meeting_link, mask minor poster identity
-- ---------------------------------------------------------------------------
create or replace function public.search_tuitions(
  p_class text default null, p_subject text default null,
  p_district text default null, p_area text default null,
  p_min_budget numeric default null, p_max_budget numeric default null,
  p_mode text default null, p_day text default null, p_time text default null,
  p_page int default 1, p_page_size int default 12)
returns json language plpgsql stable security definer set search_path = public as $$
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
      t.is_featured, t.featured_until,
      t.is_batch, t.batch_size, t.seats_filled,
      t.poster_id,
      -- Meeting links are private: only the detail RPC (get_public_tuition)
      -- may disclose them, and only to owner/student/accepted teacher/admin.
      case when po.is_minor then 'শিক্ষার্থী' else po.full_name end as poster_name,
      case when po.is_minor then 'শিক্ষার্থী' else po.display_name end as poster_display_name,
      po.role as poster_role,
      case when po.is_minor then null else po.avatar_url end as poster_avatar
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

revoke all on function public.search_tuitions(
  text, text, text, text, numeric, numeric, text, text, text, int, int
) from public;
grant execute on function public.search_tuitions(
  text, text, text, text, numeric, numeric, text, text, text, int, int
) to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Direct table access: strip meeting_link from the authenticated role.
--    The app reads meeting links only through the guarded get_public_tuition
--    RPC (security definer, relationship-aware).
--    student_id stays readable because legitimate app filters use it
--    (e.g. a guardian listing their linked student's tuitions); the identity
--    chain is closed instead by masking student_id in get_public_tuition and
--    by the relationship-scoped get_profiles_public below.
-- ---------------------------------------------------------------------------
revoke select on public.tuitions from authenticated;
grant select (
  id, title, class_level, subject, district, area, budget, budget_negotiable,
  teaching_mode, preferred_days, preferred_time, requirements, status,
  created_at, updated_at, is_featured, featured_until, is_batch, batch_size,
  seats_filled, poster_id, student_id
) on public.tuitions to authenticated;

-- ---------------------------------------------------------------------------
-- 3. get_public_tuition: disclose student_id only to the people the tuition
--    already involves (owner, the student, accepted teacher, admin).
-- ---------------------------------------------------------------------------
create or replace function public.get_public_tuition(p_tuition_id uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(row_to_json(x)::json, 'null'::json)
  from (
    select
      t.id,
      t.title,
      t.class_level,
      t.subject,
      t.district,
      case when po.is_minor then null else t.area end as area,
      t.budget,
      t.budget_negotiable,
      t.teaching_mode,
      t.preferred_days,
      t.preferred_time,
      t.requirements,
      t.status,
      t.created_at,
      t.is_featured,
      t.featured_until,
      case
        when public.is_admin()
          or auth.uid() = t.poster_id
          or auth.uid() = t.student_id
          or exists (
            select 1 from public.tuition_requests r
            where r.tuition_id = t.id
              and r.teacher_id = auth.uid()
              and r.status = 'accepted'
          )
        then t.meeting_link
        else null
      end as meeting_link,
      t.is_batch,
      t.batch_size,
      t.seats_filled,
      t.poster_id,
      case
        when public.is_admin()
          or auth.uid() = t.poster_id
          or auth.uid() = t.student_id
          or exists (
            select 1 from public.tuition_requests r
            where r.tuition_id = t.id
              and r.teacher_id = auth.uid()
              and r.status = 'accepted'
          )
        then t.student_id
        else null
      end as student_id,
      case when po.is_minor then 'শিক্ষার্থী' else po.full_name end as poster_name,
      case when po.is_minor then 'শিক্ষার্থী' else po.display_name end as poster_display_name,
      po.role as poster_role,
      case when po.is_minor then null else po.avatar_url end as poster_avatar
    from public.tuitions t
    join public.profiles po on po.id = t.poster_id
    where t.id = p_tuition_id
  ) x;
$$;

revoke all on function public.get_public_tuition(uuid) from public;
grant execute on function public.get_public_tuition(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Relationship-scoped identity lookup: minor students' names/avatars are
--    hidden from unrelated callers. Legitimate counterparts (conversation
--    partners, request/contact senders, linked guardians, tuition owner)
--    still see them, so messaging/requests keep working.
-- ---------------------------------------------------------------------------
create or replace function public.can_view_profile_identity(p_target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or auth.uid() = p_target
    or exists (
      select 1 from public.guardian_profiles gp
      where gp.id = auth.uid() and gp.linked_student_id = p_target
    )
    or exists (
      select 1 from public.conversations c
      where (c.participant_a = auth.uid() and c.participant_b = p_target)
         or (c.participant_a = p_target and c.participant_b = auth.uid())
    )
    or exists (
      select 1 from public.tuition_requests r
      where (r.sender_id = auth.uid() and r.teacher_id = p_target)
         or (r.teacher_id = auth.uid() and r.sender_id = p_target)
         or (r.sender_id = auth.uid() and r.student_id = p_target)
         or (r.teacher_id = auth.uid() and r.student_id = p_target)
         or (r.sender_id = p_target and r.student_id = auth.uid())
         or (r.teacher_id = p_target and r.student_id = auth.uid())
    )
    or exists (
      select 1 from public.tuitions t
      where (t.poster_id = auth.uid() and t.student_id = p_target)
         or (t.poster_id = p_target and t.student_id = auth.uid())
    )
    or exists (
      select 1 from public.contact_requests cr
      where (cr.sender_id = auth.uid() and cr.teacher_id = p_target)
         or (cr.teacher_id = auth.uid() and cr.sender_id = p_target)
    )
    or exists (
      select 1 from public.trial_requests tr
      where (tr.sender_id = auth.uid() and tr.teacher_id = p_target)
         or (tr.teacher_id = auth.uid() and tr.sender_id = p_target)
    );
$$;

revoke all on function public.can_view_profile_identity(uuid) from public, anon;
grant execute on function public.can_view_profile_identity(uuid) to authenticated;

create or replace function public.get_profiles_public(p_ids uuid[])
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(json_agg(t order by t.full_name asc), '[]'::json)
  from (
    select
      p.id,
      case when p.is_minor and not public.can_view_profile_identity(p.id)
        then null else p.full_name end as full_name,
      case when p.is_minor and not public.can_view_profile_identity(p.id)
        then null else p.display_name end as display_name,
      p.role,
      case when p.is_minor and not public.can_view_profile_identity(p.id)
        then null else p.avatar_url end as avatar_url,
      p.gender,
      case when p.is_minor then null else p.district end as district,
      case when p.is_minor then null else p.area end as area
    from public.profiles p
    where p.id = any (p_ids)
  ) t;
$$;

revoke all on function public.get_profiles_public(uuid[]) from public, anon;
grant execute on function public.get_profiles_public(uuid[]) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Reviews: identity, verification and moderation state are immutable for
--    non-admin sessions. Reviewers may only edit rating/body/tuition of
--    their own published review.
-- ---------------------------------------------------------------------------
create or replace function public.validate_review_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then return new; end if;

  if new.id is distinct from old.id
     or new.teacher_id is distinct from old.teacher_id
     or new.reviewer_id is distinct from old.reviewer_id
     or new.status is distinct from old.status
     or new.verified is distinct from old.verified
     or new.created_at is distinct from old.created_at then
    raise exception 'Review identity, verification and moderation state are immutable.' using errcode = '42501';
  end if;

  if old.status <> 'published' then
    raise exception 'Only a published review can be edited.' using errcode = '42501';
  end if;

  if auth.uid() is distinct from old.reviewer_id then
    raise exception 'Only the reviewer can edit this review.' using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.validate_review_update() from public, anon, authenticated;

drop trigger if exists reviews_validate_update on public.reviews;
create trigger reviews_validate_update
  before update on public.reviews
  for each row execute function public.validate_review_update();

-- ---------------------------------------------------------------------------
-- 6. admin_analytics(): require an active admin / super admin.
-- ---------------------------------------------------------------------------
create or replace function public.admin_analytics()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_users bigint; v_teachers bigint; v_students bigint; v_guardians bigint;
  v_tuitions bigint; v_open_tuitions bigint;
  v_requests bigint; v_accepted bigint;
  v_reviews bigint;
  v_top_subjects json; v_top_districts json;
begin
  if auth.uid() is null or not exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.account_status = 'active'
      and (p.role = 'admin' or p.is_super_admin = true)
  ) then
    raise exception 'Admin access required.' using errcode = '42501';
  end if;

  select count(*) into v_users from public.profiles;
  select count(*) into v_teachers from public.profiles where role='teacher';
  select count(*) into v_students from public.profiles where role='student';
  select count(*) into v_guardians from public.profiles where role='guardian';
  select count(*) into v_tuitions from public.tuitions;
  select count(*) into v_open_tuitions from public.tuitions where status='open';
  select count(*) into v_requests from public.tuition_requests;
  select count(*) into v_accepted from public.tuition_requests where status='accepted';
  select count(*) into v_reviews from public.reviews where status='published';

  select coalesce(json_agg(x), '[]'::json) into v_top_subjects from (
    select subject, count(*) as c from public.tuitions group by subject order by c desc limit 5
  ) x;

  select coalesce(json_agg(x), '[]'::json) into v_top_districts from (
    select district, count(*) as c from public.profiles where district is not null group by district order by c desc limit 5
  ) x;

  return json_build_object(
    'users', v_users, 'teachers', v_teachers, 'students', v_students, 'guardians', v_guardians,
    'tuitions', v_tuitions, 'open_tuitions', v_open_tuitions,
    'requests', v_requests, 'accepted', v_accepted, 'reviews', v_reviews,
    'match_rate', case when v_requests > 0 then round(100.0*v_accepted/v_requests,1) else 0 end,
    'top_subjects', v_top_subjects, 'top_districts', v_top_districts
  );
end;
$$;

revoke all on function public.admin_analytics() from public, anon;
grant execute on function public.admin_analytics() to authenticated;

-- ---------------------------------------------------------------------------
-- 7. Message retention: bound the insert-trigger cleanup to the inserted
--    conversation instead of scanning the whole table. pg_cron keeps the
--    hourly full sweep (see 0025).
-- ---------------------------------------------------------------------------
create or replace function public.prune_expired_messages_for_conversation()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_deleted integer := 0;
begin
  with deleted as (
    delete from public.messages
    where conversation_id = new.conversation_id
      and created_at < now() - interval '48 hours'
    returning conversation_id
  )
  select count(*)::integer into v_deleted from deleted;

  if v_deleted > 0 then
    update public.conversations c
    set last_message_at = (
      select max(m.created_at)
      from public.messages m
      where m.conversation_id = c.id
    )
    where c.id = new.conversation_id;
  end if;

  return new;
end;
$$;

revoke all on function public.prune_expired_messages_for_conversation() from public, anon, authenticated;

drop trigger if exists messages_retention_prune on public.messages;
drop trigger if exists messages_retention_prune_row on public.messages;
create trigger messages_retention_prune_row
  after insert on public.messages
  for each row execute function public.prune_expired_messages_for_conversation();

-- ---------------------------------------------------------------------------
-- 8. Tuitions: ownership immutability + status state machine + meeting-link
--    guard, enforced server-side even for direct REST writes.
-- ---------------------------------------------------------------------------
create or replace function public.validate_tuition_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_allowed boolean;
begin
  if coalesce(auth.role(), '') = 'service_role' or public.is_admin() then
    return new;
  end if;

  -- Ownership is immutable after creation.
  if new.poster_id is distinct from old.poster_id
     or new.student_id is distinct from old.student_id then
    raise exception 'Tuition ownership is immutable.' using errcode = '42501';
  end if;

  -- Meeting link: only the owner or the accepted teacher may set it.
  if new.meeting_link is distinct from old.meeting_link then
    if auth.uid() <> old.poster_id
       and not exists (
         select 1 from public.tuition_requests r
         where r.tuition_id = old.id
           and r.teacher_id = auth.uid()
           and r.status = 'accepted'
       ) then
      raise exception 'Only the owner or the accepted teacher can change the meeting link.' using errcode = '42501';
    end if;
  end if;

  -- Status state machine (mirrors the app's OWNER_STATUS_TRANSITIONS).
  if new.status is distinct from old.status then
    v_allowed := case old.status
      when 'open' then new.status in ('paused', 'closed', 'assigned')
      when 'paused' then new.status in ('open', 'closed')
      when 'assigned' then new.status in ('completed', 'paused')
      else false
    end;

    if not v_allowed then
      raise exception 'Invalid tuition status transition.' using errcode = '42501';
    end if;

    -- 'assigned' may only be reached through an accepted request by the
    -- acting teacher (set by notify_request_response in 0017).
    if new.status = 'assigned' and not exists (
      select 1 from public.tuition_requests r
      where r.tuition_id = old.id
        and r.teacher_id = auth.uid()
        and r.status = 'accepted'
    ) then
      raise exception 'A tuition can only be assigned through an accepted request.' using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.validate_tuition_update() from public, anon, authenticated;

drop trigger if exists tuitions_validate_update on public.tuitions;
create trigger tuitions_validate_update
  before update on public.tuitions
  for each row execute function public.validate_tuition_update();

-- ---------------------------------------------------------------------------
-- 9. Messaging rate limits (server-side, direct REST included).
-- ---------------------------------------------------------------------------
create index if not exists messages_sender_created_idx
  on public.messages (sender_id, created_at desc);
create index if not exists conversations_participant_created_idx
  on public.conversations (participant_a, created_at desc);

create or replace function public.validate_message_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recent int;
begin
  if coalesce(auth.role(), '') = 'service_role' then return new; end if;

  if new.sender_id is distinct from auth.uid() then
    raise exception 'You can only send messages as yourself.' using errcode = '42501';
  end if;

  select count(*)::int into v_recent
  from public.messages m
  where m.sender_id = new.sender_id
    and m.created_at > now() - interval '60 seconds';

  if v_recent >= 30 then
    raise exception 'Message limit reached. Please slow down.' using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.validate_message_insert() from public, anon, authenticated;

drop trigger if exists messages_validate_insert on public.messages;
create trigger messages_validate_insert
  before insert on public.messages
  for each row execute function public.validate_message_insert();

create or replace function public.validate_conversation_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recent int;
begin
  if coalesce(auth.role(), '') = 'service_role' then return new; end if;

  if new.participant_a = new.participant_b then
    raise exception 'A conversation needs two different participants.' using errcode = '42501';
  end if;

  select count(*)::int into v_recent
  from public.conversations c
  where (c.participant_a = new.participant_a or c.participant_b = new.participant_a)
    and c.created_at > now() - interval '60 minutes';

  if v_recent >= 20 then
    raise exception 'Too many new conversations. Please try later.' using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.validate_conversation_insert() from public, anon, authenticated;

drop trigger if exists conversations_validate_insert on public.conversations;
create trigger conversations_validate_insert
  before insert on public.conversations
  for each row execute function public.validate_conversation_insert();

-- ---------------------------------------------------------------------------
-- 10. Profile views: authenticated, non-owner views only (no anon/bot inflate).
-- ---------------------------------------------------------------------------
create or replace function public.record_profile_view(p_teacher_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or auth.uid() = p_teacher_id then
    return;
  end if;
  update public.teacher_profiles set profile_views = profile_views + 1 where id = p_teacher_id;
end;
$$;

revoke all on function public.record_profile_view(uuid) from public, anon;
grant execute on function public.record_profile_view(uuid) to authenticated;
