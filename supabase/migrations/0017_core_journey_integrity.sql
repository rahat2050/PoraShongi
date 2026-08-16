-- Core tuition journey authorization and state integrity.
-- Keeps student/guardian ownership, teacher acceptance and scheduling aligned
-- even when requests are sent directly to the database instead of the UI.

-- Only students/guardians (or admins) may publish tuition requirements.
drop policy if exists "tuitions_insert_own" on public.tuitions;
create policy "tuitions_insert_own" on public.tuitions
  for insert to authenticated
  with check (
    public.is_admin()
    or (
      auth.uid() = poster_id
      and exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
          and p.role in ('student', 'guardian')
          and p.account_status = 'active'
      )
    )
  );

-- A request must refer to the sender's own open tuition and an active,
-- publish-ready teacher. Blocked users cannot create a new request.
create or replace function public.validate_tuition_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sender_role text;
  v_tuition public.tuitions%rowtype;
begin
  select role::text into v_sender_role
  from public.profiles
  where id = new.sender_id and account_status = 'active';

  if v_sender_role not in ('student', 'guardian') then
    raise exception 'Only active students or guardians can send tuition requests.';
  end if;

  select * into v_tuition from public.tuitions where id = new.tuition_id;
  if v_tuition.id is null or v_tuition.status <> 'open' then
    raise exception 'The selected tuition is not open.';
  end if;

  if not (
    v_tuition.poster_id = new.sender_id
    or v_tuition.student_id = new.sender_id
    or (
      v_sender_role = 'guardian'
      and exists (
        select 1 from public.guardian_profiles gp
        where gp.id = new.sender_id
          and gp.linked_student_id is not null
          and gp.linked_student_id = v_tuition.student_id
      )
    )
  ) then
    raise exception 'You can only request a teacher for your own tuition.';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = new.teacher_id
      and p.role = 'teacher'
      and p.account_status = 'active'
  ) or not public.is_teacher_profile_publishable(new.teacher_id) then
    raise exception 'The selected teacher is not available.';
  end if;

  if new.teacher_id = new.sender_id then
    raise exception 'You cannot request yourself.';
  end if;

  if exists (
    select 1 from public.blocks b
    where (b.blocker_id = new.sender_id and b.blocked_id = new.teacher_id)
       or (b.blocker_id = new.teacher_id and b.blocked_id = new.sender_id)
  ) then
    raise exception 'This request is not allowed.';
  end if;

  new.student_id := coalesce(new.student_id, v_tuition.student_id);
  return new;
end;
$$;

-- Mirror the trigger checks at the RLS boundary.
drop policy if exists "tuition_requests_insert_own" on public.tuition_requests;
create policy "tuition_requests_insert_own" on public.tuition_requests
  for insert to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.tuitions t
      where t.id = tuition_id
        and t.status = 'open'
        and (
          t.poster_id = auth.uid()
          or t.student_id = auth.uid()
          or exists (
            select 1 from public.guardian_profiles gp
            where gp.id = auth.uid()
              and gp.linked_student_id = t.student_id
          )
        )
    )
  );

-- Serialize acceptance on the tuition row so two teachers cannot both accept
-- the same tuition concurrently.
create or replace function public.check_request_status_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tuition_status text;
begin
  if old.status <> 'pending' or new.status not in ('accepted', 'rejected', 'withdrawn') then
    raise exception 'Invalid tuition request status transition.';
  end if;

  if new.status = 'accepted'
     and auth.uid() <> old.teacher_id
     and not public.is_admin() then
    raise exception 'Only the selected teacher can accept this request.';
  end if;

  if new.status = 'rejected'
     and auth.uid() <> old.teacher_id
     and not public.is_admin()
     and not exists (
       select 1
       from public.tuitions t
       join public.tuition_requests accepted
         on accepted.tuition_id = t.id and accepted.status = 'accepted'
       where t.id = old.tuition_id and t.status = 'assigned'
     ) then
    raise exception 'Only the selected teacher can reject this request.';
  end if;

  if new.status = 'withdrawn'
     and auth.uid() <> old.sender_id
     and auth.uid() is distinct from old.student_id
     and not public.is_admin() then
    raise exception 'Only the sender can withdraw this request.';
  end if;

  if new.status = 'accepted' then
    select status::text into v_tuition_status
    from public.tuitions
    where id = new.tuition_id
    for update;

    if v_tuition_status is distinct from 'open' then
      raise exception 'This tuition has already been assigned or closed.';
    end if;
  end if;

  new.responded_at := now();
  return new;
end;
$$;

-- Request ownership, target and message are immutable after submission.
create or replace function public.validate_tuition_request_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.id is distinct from old.id
     or new.tuition_id is distinct from old.tuition_id
     or new.sender_id is distinct from old.sender_id
     or new.teacher_id is distinct from old.teacher_id
     or new.student_id is distinct from old.student_id
     or new.message is distinct from old.message
     or new.created_at is distinct from old.created_at then
    raise exception 'Tuition request ownership and content are immutable.';
  end if;
  return new;
end;
$$;

drop trigger if exists tuition_requests_validate_update on public.tuition_requests;
create trigger tuition_requests_validate_update
  before update on public.tuition_requests
  for each row execute function public.validate_tuition_request_update();

-- Assign the tuition and automatically reject other pending requests.
create or replace function public.notify_request_response()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    if new.status = 'accepted' then
      update public.tuitions
      set status = 'assigned'
      where id = new.tuition_id and status = 'open';

      update public.tuition_requests
      set status = 'rejected'
      where tuition_id = new.tuition_id
        and id <> new.id
        and status = 'pending';

      insert into public.notifications (user_id, type, title, body, link)
      values (
        new.sender_id,
        'request_accepted',
        'টিউশন অনুরোধ গৃহীত',
        'একজন শিক্ষক আপনার টিউশন অনুরোধ গ্রহণ করেছেন।',
        '/dashboard/requests'
      );
    elsif new.status = 'rejected' then
      insert into public.notifications (user_id, type, title, body, link)
      values (
        new.sender_id,
        'request_rejected',
        'টিউশন অনুরোধ প্রত্যাখ্যাত',
        'একজন শিক্ষক আপনার টিউশন অনুরোধ প্রত্যাখ্যান করেছেন।',
        '/dashboard/requests'
      );
    end if;
  end if;
  return new;
end;
$$;

-- Teachers may schedule/update/delete sessions only for tuitions they have
-- actually accepted.
drop policy if exists "sessions_insert_teacher" on public.sessions;
create policy "sessions_insert_teacher" on public.sessions
  for insert to authenticated
  with check (
    public.is_admin()
    or (
      auth.uid() = teacher_id
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
      and exists (
        select 1 from public.tuition_requests r
        where r.tuition_id = sessions.tuition_id
          and r.teacher_id = auth.uid()
          and r.status = 'accepted'
      )
    )
  );

-- Return the meeting link only to the tuition owner/student, the accepted
-- teacher, or an admin. Protect a minor poster's display identity and area.
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
      t.student_id,
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

-- Conversation participants may mark received messages as read, but cannot
-- edit message text, sender identity, timestamps or conversation ownership.
create or replace function public.validate_message_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then return new; end if;

  if new.id is distinct from old.id
     or new.conversation_id is distinct from old.conversation_id
     or new.sender_id is distinct from old.sender_id
     or new.body is distinct from old.body
     or new.created_at is distinct from old.created_at then
    raise exception 'Message content and ownership are immutable.';
  end if;

  if old.status <> 'sent' or new.status <> 'read' or auth.uid() = old.sender_id then
    raise exception 'Only the recipient can mark a sent message as read.';
  end if;

  if not exists (
    select 1 from public.conversations c
    where c.id = old.conversation_id
      and auth.uid() in (c.participant_a, c.participant_b)
  ) then
    raise exception 'You are not a participant in this conversation.';
  end if;

  return new;
end;
$$;

drop trigger if exists messages_validate_update on public.messages;
create trigger messages_validate_update
  before update on public.messages
  for each row execute function public.validate_message_update();

-- Conversation participant IDs are immutable after creation. The
-- security-definer message notification trigger can still update timestamps.
drop policy if exists "conversations_update_own" on public.conversations;
revoke update on public.conversations from authenticated;
