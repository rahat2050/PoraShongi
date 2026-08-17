-- Batch enrollment, trial requests and related notifications.

-- Compatibility helper when this migration is applied manually before 0018.
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

-- ---------------------------------------------------------------------------
-- Batch membership: lock the tuition row to prevent overselling seats.
-- ---------------------------------------------------------------------------
create or replace function public.validate_batch_join()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tuition public.tuitions%rowtype;
  v_count int;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = new.student_id
      and p.role = 'student'
      and p.account_status = 'active'
  ) then
    raise exception 'Only active students can join a batch.';
  end if;

  select * into v_tuition
  from public.tuitions
  where id = new.tuition_id
  for update;

  if v_tuition.id is null
     or not v_tuition.is_batch
     or v_tuition.status <> 'open'
     or v_tuition.batch_size is null then
    raise exception 'This batch is not available.';
  end if;

  if v_tuition.poster_id = new.student_id or v_tuition.student_id = new.student_id then
    raise exception 'You cannot join your own batch.';
  end if;

  select count(*)::int into v_count
  from public.batch_members
  where tuition_id = new.tuition_id;

  if v_count >= v_tuition.batch_size then
    raise exception 'This batch is full.';
  end if;

  return new;
end;
$$;

drop trigger if exists batch_members_validate_join on public.batch_members;
create trigger batch_members_validate_join
  before insert on public.batch_members
  for each row execute function public.validate_batch_join();

create or replace function public.sync_batch_seats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tuition_id uuid := coalesce(new.tuition_id, old.tuition_id);
begin
  update public.tuitions t
  set seats_filled = (
    select count(*)::int from public.batch_members bm where bm.tuition_id = v_tuition_id
  )
  where t.id = v_tuition_id;
  return coalesce(new, old);
end;
$$;

drop trigger if exists batch_members_sync_seats on public.batch_members;
create trigger batch_members_sync_seats
  after insert or delete on public.batch_members
  for each row execute function public.sync_batch_seats();

drop policy if exists "batch_members_insert_own" on public.batch_members;
create policy "batch_members_insert_own" on public.batch_members
  for insert to authenticated
  with check (
    auth.uid() = student_id
    and public.is_active_user()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'student'
    )
  );

drop policy if exists "batch_members_delete_own" on public.batch_members;
create policy "batch_members_delete_own" on public.batch_members
  for delete to authenticated
  using ((auth.uid() = student_id and public.is_active_user()) or public.is_admin());

-- ---------------------------------------------------------------------------
-- Trial requests: immutable ownership, availability, cooldown and transitions.
-- ---------------------------------------------------------------------------
create or replace function public.validate_trial_request_insert()
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
    raise exception 'Only active students or guardians can request a trial.';
  end if;

  if not exists (
    select 1
    from public.profiles p
    join public.teacher_profiles tp on tp.id = p.id
    where p.id = new.teacher_id
      and p.role = 'teacher'
      and p.account_status = 'active'
      and tp.trial_available = true
  ) or not public.is_teacher_profile_publishable(new.teacher_id) then
    raise exception 'This teacher is not accepting trial requests.';
  end if;

  if new.sender_id = new.teacher_id then
    raise exception 'You cannot request yourself.';
  end if;

  if char_length(coalesce(new.message, '')) > 1000 then
    raise exception 'Trial message is too long.';
  end if;

  if exists (
    select 1 from public.blocks b
    where (b.blocker_id = new.sender_id and b.blocked_id = new.teacher_id)
       or (b.blocker_id = new.teacher_id and b.blocked_id = new.sender_id)
  ) then
    raise exception 'This trial request is not allowed.';
  end if;

  if exists (
    select 1 from public.trial_requests tr
    where tr.sender_id = new.sender_id
      and tr.teacher_id = new.teacher_id
      and tr.created_at > now() - interval '7 days'
  ) then
    raise exception 'Please wait seven days before requesting another trial from this teacher.';
  end if;

  new.status := 'pending';
  new.responded_at := null;
  return new;
end;
$$;

drop trigger if exists trial_requests_validate_insert on public.trial_requests;
create trigger trial_requests_validate_insert
  before insert on public.trial_requests
  for each row execute function public.validate_trial_request_insert();

create or replace function public.validate_trial_request_update()
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
     or new.message is distinct from old.message
     or new.created_at is distinct from old.created_at then
    raise exception 'Trial request ownership and content are immutable.';
  end if;

  if old.status <> 'pending' or new.status not in ('accepted', 'rejected') then
    raise exception 'Invalid trial request transition.';
  end if;

  if auth.uid() <> old.teacher_id and not public.is_admin() then
    raise exception 'Only the selected teacher can answer this trial request.';
  end if;

  new.responded_at := now();
  return new;
end;
$$;

drop trigger if exists trial_requests_validate_update on public.trial_requests;
create trigger trial_requests_validate_update
  before update on public.trial_requests
  for each row execute function public.validate_trial_request_update();

drop policy if exists "trial_requests_insert" on public.trial_requests;
create policy "trial_requests_insert" on public.trial_requests
  for insert to authenticated
  with check (
    auth.uid() = sender_id
    and public.is_active_user()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('student', 'guardian')
    )
  );

drop policy if exists "trial_requests_update" on public.trial_requests;
create policy "trial_requests_update" on public.trial_requests
  for update to authenticated
  using ((auth.uid() = teacher_id and public.is_active_user()) or public.is_admin())
  with check ((auth.uid() = teacher_id and public.is_active_user()) or public.is_admin());

create or replace function public.notify_trial_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, body, link)
  values (
    new.teacher_id,
    'trial_request',
    'নতুন ট্রায়াল ক্লাসের অনুরোধ',
    'একজন শিক্ষার্থী বা অভিভাবক ট্রায়াল ক্লাস চেয়েছেন।',
    '/dashboard'
  );
  return new;
end;
$$;

drop trigger if exists trial_requests_notify_insert on public.trial_requests;
create trigger trial_requests_notify_insert
  after insert on public.trial_requests
  for each row execute function public.notify_trial_request();

create or replace function public.notify_trial_response()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      new.sender_id,
      case when new.status = 'accepted' then 'trial_accepted' else 'trial_rejected' end,
      case when new.status = 'accepted' then 'ট্রায়াল ক্লাস গৃহীত' else 'ট্রায়াল ক্লাস প্রত্যাখ্যাত' end,
      case when new.status = 'accepted'
        then 'শিক্ষক আপনার ট্রায়াল ক্লাসের অনুরোধ গ্রহণ করেছেন।'
        else 'শিক্ষক আপনার ট্রায়াল ক্লাসের অনুরোধ প্রত্যাখ্যান করেছেন।'
      end,
      '/dashboard'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trial_requests_notify_update on public.trial_requests;
create trigger trial_requests_notify_update
  after update of status on public.trial_requests
  for each row execute function public.notify_trial_response();
