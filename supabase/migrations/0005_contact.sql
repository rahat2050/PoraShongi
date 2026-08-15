-- ============================================================================
-- PoraSathi (পড়াসাথী) — 0005: Contact request + notification cleanup
-- ----------------------------------------------------------------------------
-- 1. contact_requests — student/guardian teacher-এর ফোন/যোগাযোগ চায় (privacy)
-- 2. notification cleanup function — পুরনো read notification মুছে ডাটাবেস হালকা
-- Idempotent — safe to re-run.
-- ============================================================================

-- 1. contact_requests --------------------------------------------------------
create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create index if not exists contact_requests_teacher_idx on public.contact_requests (teacher_id, created_at desc);
create index if not exists contact_requests_sender_idx on public.contact_requests (sender_id);

-- duplicate active prevent
create unique index if not exists contact_requests_active_unique
  on public.contact_requests (sender_id, teacher_id)
  where status = 'pending';

-- teacher-এর ফোন তখনই দেখাবে যখন accepted contact request আছে (auth.uid() নিরাপদ)
create or replace function public.get_teacher_phone(p_teacher_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.phone
  from public.profiles p
  where p.id = p_teacher_id
    and exists (
      select 1 from public.contact_requests c
      where c.teacher_id = p_teacher_id
        and c.sender_id = auth.uid()
        and c.status = 'accepted'
    );
$$;

-- notification: contact request → teacher
create or replace function public.notify_contact_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'pending' then
    insert into public.notifications (user_id, type, title, body, link)
    values (new.teacher_id, 'contact_request', 'যোগাযোগের অনুরোধ',
            'কেউ আপনার যোগাযোগ তথ্য চেয়েছে।', '/dashboard/requests');
  end if;
  return new;
end;
$$;

drop trigger if exists contact_requests_notify on public.contact_requests;
create trigger contact_requests_notify after insert on public.contact_requests
  for each row execute function public.notify_contact_request();

-- accepted/rejected → sender notification + responded_at
create or replace function public.notify_contact_response()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    new.responded_at := now();
    if new.status = 'accepted' then
      insert into public.notifications (user_id, type, title, body, link)
      values (new.sender_id, 'contact_accepted', 'যোগাযোগ মঞ্জুর',
              'শিক্ষক আপনার যোগাযোগ অনুরোধ accept করেছেন।', '/dashboard/requests');
    elsif new.status = 'rejected' then
      insert into public.notifications (user_id, type, title, body, link)
      values (new.sender_id, 'contact_rejected', 'যোগাযোগ প্রত্যাখ্যান',
              'শিক্ষক আপনার যোগাযোগ অনুরোধ প্রত্যাখ্যান করেছেন।', '/dashboard/requests');
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists contact_requests_response on public.contact_requests;
create trigger contact_requests_response before update of status on public.contact_requests
  for each row execute function public.notify_contact_response();

-- RLS
alter table public.contact_requests enable row level security;

drop policy if exists "contact_requests_select_involved" on public.contact_requests;
create policy "contact_requests_select_involved" on public.contact_requests
  for select to authenticated
  using (auth.uid() = sender_id or auth.uid() = teacher_id or public.is_admin());

drop policy if exists "contact_requests_insert_own" on public.contact_requests;
create policy "contact_requests_insert_own" on public.contact_requests
  for insert to authenticated with check (auth.uid() = sender_id);

drop policy if exists "contact_requests_update_teacher" on public.contact_requests;
create policy "contact_requests_update_teacher" on public.contact_requests
  for update to authenticated
  using (auth.uid() = teacher_id or public.is_admin())
  with check (auth.uid() = teacher_id or public.is_admin());

drop policy if exists "contact_requests_delete_admin" on public.contact_requests;
create policy "contact_requests_delete_admin" on public.contact_requests
  for delete to authenticated using (public.is_admin());

grant select, insert, update on public.contact_requests to authenticated;
grant execute on function public.get_teacher_phone(uuid) to authenticated;

-- 2. notification cleanup (৩০ দিনের পুরনো read notification মুছে) -------------
create or replace function public.cleanup_old_notifications(p_days int default 30)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare v_deleted int;
begin
  delete from public.notifications
  where read = true and created_at < now() - make_interval(days => p_days);
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

grant execute on function public.cleanup_old_notifications(int) to authenticated;
