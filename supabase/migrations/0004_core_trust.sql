-- ============================================================================
-- PoraSathi (পড়াসাথী) — Phase 3: Core Platform & Trust
-- ----------------------------------------------------------------------------
-- Messaging, Schedule+Attendance, Review/Rating, Verification tiers,
-- Child safety, Report/Block, Notification preferences, Reputation.
-- আগের migration (0000..0003) চালানোর পরে এটা চালাও। Idempotent.
-- ============================================================================

-- ============================================================================
-- 1. Profiles — trust & safety columns
-- ============================================================================
alter table public.profiles
  add column if not exists phone text,
  add column if not exists phone_verified boolean not null default false,
  add column if not exists education_verified boolean not null default false,
  add column if not exists identity_verified boolean not null default false,
  add column if not exists trusted_tutor boolean not null default false;

-- ============================================================================
-- 2. Sessions — schedule + attendance
-- ============================================================================
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  tuition_id uuid not null references public.tuitions (id) on delete cascade,
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid references public.profiles (id) on delete set null,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled'
    check (status in ('scheduled','completed','cancelled','rescheduled')),
  attendance text check (attendance in ('present','absent')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sessions_teacher_idx on public.sessions (teacher_id, scheduled_at);
create index if not exists sessions_tuition_idx on public.sessions (tuition_id, scheduled_at);

-- ============================================================================
-- 3. Conversations + Messages
-- ============================================================================
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  tuition_id uuid references public.tuitions (id) on delete set null,
  participant_a uuid not null references public.profiles (id) on delete cascade,
  participant_b uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz,
  constraint conversations_ordered check (participant_a < participant_b),
  constraint conversations_unique unique (participant_a, participant_b)
);

create index if not exists conversations_participant_a_idx on public.conversations (participant_a, last_message_at desc);
create index if not exists conversations_participant_b_idx on public.conversations (participant_b, last_message_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  status text not null default 'sent' check (status in ('sent','read')),
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

-- ============================================================================
-- 4. Reviews
-- ============================================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  tuition_id uuid references public.tuitions (id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  body text check (char_length(coalesce(body,'')) <= 2000),
  verified boolean not null default false,
  status text not null default 'published' check (status in ('published','hidden','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_unique unique (teacher_id, reviewer_id)
);

create index if not exists reviews_teacher_idx on public.reviews (teacher_id, created_at desc);

-- ============================================================================
-- 5. Reports + Blocks + Notification preferences
-- ============================================================================
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('teacher','student','guardian','tuition','review','conversation')),
  target_id uuid not null,
  category text not null check (category in ('fake_profile','harassment','inappropriate','scam','spam','safety_concern','other')),
  details text check (char_length(coalesce(details,'')) <= 2000),
  status text not null default 'open' check (status in ('open','investigating','resolved','dismissed')),
  resolution text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists reports_status_idx on public.reports (status, created_at desc);
create unique index if not exists reports_open_unique
  on public.reports (reporter_id, target_type, target_id)
  where status in ('open','investigating');

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint blocks_unique unique (blocker_id, blocked_id)
);

create index if not exists blocks_blocked_idx on public.blocks (blocked_id);

create table if not exists public.notification_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  new_match boolean not null default true,
  new_request boolean not null default true,
  request_response boolean not null default true,
  new_message boolean not null default true,
  upcoming_class boolean not null default true,
  schedule_change boolean not null default true,
  review_received boolean not null default true,
  verification_update boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 6. Helpers + verification tier
-- ============================================================================
create or replace function public.ensure_notification_preferences()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notification_preferences (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end; $$;

drop trigger if exists profiles_ensure_preferences on public.profiles;
create trigger profiles_ensure_preferences after insert on public.profiles
  for each row execute function public.ensure_notification_preferences();

create or replace function public.push_notification(
  p_user_id uuid, p_type text, p_title text, p_body text, p_link text, p_enabled boolean default true)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_enabled then
    insert into public.notifications (user_id, type, title, body, link)
    values (p_user_id, p_type, p_title, p_body, p_link);
  end if;
end; $$;

create or replace function public.verification_tier(p_user_id uuid)
returns text language sql stable security definer set search_path = public as $$
  select case
    when p.trusted_tutor then 'trusted'
    when p.identity_verified then 'identity'
    when p.education_verified then 'education'
    when p.phone_verified then 'phone'
    else 'unverified'
  end
  from public.profiles p where p.id = p_user_id;
$$;

-- ============================================================================
-- 7. Review validation + rating sync + reputation
-- ============================================================================
create or replace function public.validate_review()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_role text;
begin
  select role into v_role from public.profiles where id = new.reviewer_id;
  if v_role not in ('student','guardian') then
    raise exception 'Only students or guardians can review teachers.';
  end if;
  if new.teacher_id = new.reviewer_id then
    raise exception 'You cannot review yourself.';
  end if;
  select exists (
    select 1 from public.tuition_requests r
    where r.teacher_id = new.teacher_id
      and (r.sender_id = new.reviewer_id or r.student_id = new.reviewer_id)
      and r.status = 'accepted'
  ) into new.verified;
  if not new.verified then
    raise exception 'You can only review after an accepted tuition interaction.';
  end if;
  return new;
end; $$;

drop trigger if exists reviews_validate on public.reviews;
create trigger reviews_validate before insert on public.reviews
  for each row execute function public.validate_review();

create or replace function public.refresh_teacher_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_teacher uuid;
begin
  v_teacher := coalesce(new.teacher_id, old.teacher_id);
  update public.teacher_profiles tp set
    rating_avg = coalesce((select round(avg(rating)::numeric,1) from public.reviews r
      where r.teacher_id = v_teacher and r.status = 'published'), 0),
    review_count = (select count(*) from public.reviews r
      where r.teacher_id = v_teacher and r.status = 'published')
  where tp.id = v_teacher;
  return coalesce(new, old);
end; $$;

drop trigger if exists reviews_refresh_rating on public.reviews;
create trigger reviews_refresh_rating after insert or update or delete on public.reviews
  for each row execute function public.refresh_teacher_rating();

create or replace function public.get_teacher_reputation(p_teacher_id uuid)
returns json language sql stable security definer set search_path = public as $$
  select coalesce(row_to_json(x)::json, 'null'::json) from (
    select p.verification_status, p.phone_verified, p.education_verified,
      p.identity_verified, p.trusted_tutor, public.verification_tier(p.id) as tier,
      coalesce(tp.rating_avg,0) as rating_avg, coalesce(tp.review_count,0) as review_count,
      (select count(*) from public.tuitions t
        join public.tuition_requests r on r.tuition_id = t.id
        where r.teacher_id = p.id and r.status = 'accepted' and t.status = 'completed') as completed_tuitions,
      coalesce((select round(100.0 * count(*) filter (where r.status='accepted')
        / nullif(count(*) filter (where r.status in ('accepted','rejected')),0),0)
        from public.tuition_requests r where r.teacher_id = p.id), 0) as response_rate,
      coalesce((select round(100.0 * count(*) filter (where s.status='cancelled')
        / nullif(count(*),0),0) from public.sessions s where s.teacher_id = p.id), 0) as cancellation_rate
    from public.profiles p
    join public.teacher_profiles tp on tp.id = p.id
    where p.id = p_teacher_id and p.role = 'teacher'
  ) x;
$$;

create or replace function public.get_teacher_reviews(p_teacher_id uuid, p_page int default 1, p_page_size int default 10)
returns json language plpgsql stable security definer set search_path = public as $$
declare
  v_offset int := greatest(coalesce(p_page,1)-1,0) * least(coalesce(p_page_size,10),50);
  v_total bigint; v_results json;
begin
  select count(*) into v_total from public.reviews r
  where r.teacher_id = p_teacher_id and r.status = 'published';

  select coalesce(json_agg(x order by x.created_at desc),'[]'::json) into v_results from (
    select r.id, r.rating, r.body, r.verified, r.created_at,
      p.full_name as reviewer_name, p.display_name as reviewer_display_name,
      p.avatar_url as reviewer_avatar, p.role as reviewer_role
    from public.reviews r join public.profiles p on p.id = r.reviewer_id
    where r.teacher_id = p_teacher_id and r.status = 'published'
    limit least(coalesce(p_page_size,10),50) offset v_offset
  ) x;

  return json_build_object('total', v_total, 'page', greatest(coalesce(p_page,1),1),
    'page_size', least(coalesce(p_page_size,10),50), 'results', v_results);
end; $$;

create or replace function public.get_teacher_own_reviews(p_teacher_id uuid)
returns json language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(x order by x.created_at desc),'[]'::json) from (
    select r.id, r.rating, r.body, r.verified, r.status, r.created_at,
      p.full_name as reviewer_name, p.display_name as reviewer_display_name, p.avatar_url as reviewer_avatar
    from public.reviews r join public.profiles p on p.id = r.reviewer_id
    where r.teacher_id = p_teacher_id
  ) x;
$$;

-- ============================================================================
-- 8. Notification triggers
-- ============================================================================
create or replace function public.on_new_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_conv public.conversations%rowtype; v_other uuid; v_enabled boolean := true;
begin
  select * into v_conv from public.conversations where id = new.conversation_id;
  if v_conv.id is null then return new; end if;
  update public.conversations set updated_at = now(), last_message_at = now() where id = new.conversation_id;
  v_other := case when v_conv.participant_a = new.sender_id then v_conv.participant_b else v_conv.participant_a end;
  select np.new_message into v_enabled from public.notification_preferences np where np.user_id = v_other;
  if v_enabled is null then v_enabled := true; end if;
  perform public.push_notification(v_other, 'new_message', 'নতুন বার্তা', 'আপনার একটি নতুন বার্তা এসেছে।', '/messages/' || new.conversation_id, v_enabled);
  return new;
end; $$;

drop trigger if exists messages_notify on public.messages;
create trigger messages_notify after insert on public.messages
  for each row execute function public.on_new_message();

create or replace function public.on_session_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_tuition public.tuitions%rowtype; v_recipient uuid; v_enabled boolean := true;
begin
  select * into v_tuition from public.tuitions where id = coalesce(new.tuition_id, old.tuition_id);
  if v_tuition.id is null then return coalesce(new, old); end if;
  v_recipient := coalesce(v_tuition.student_id, v_tuition.poster_id);

  if tg_op = 'INSERT' and new.status = 'scheduled' then
    select np.upcoming_class into v_enabled from public.notification_preferences np where np.user_id = v_recipient;
    if v_enabled is null then v_enabled := true; end if;
    perform public.push_notification(v_recipient, 'upcoming_class', 'আসন্ন ক্লাস', 'নতুন ক্লাস schedule হয়েছে।', '/dashboard/schedule', v_enabled);
  elsif tg_op = 'UPDATE' and old.status is distinct from new.status then
    select np.schedule_change into v_enabled from public.notification_preferences np where np.user_id = v_recipient;
    if v_enabled is null then v_enabled := true; end if;
    if new.status = 'cancelled' then
      perform public.push_notification(v_recipient, 'cancelled_class', 'ক্লাস বাতিল', 'একটি ক্লাস বাতিল হয়েছে।', '/dashboard/schedule', v_enabled);
    elsif new.status = 'rescheduled' then
      perform public.push_notification(v_recipient, 'schedule_change', 'সময় বদলেছে', 'একটি ক্লাসের সময় বদলানো হয়েছে।', '/dashboard/schedule', v_enabled);
    end if;
  end if;
  return coalesce(new, old);
end; $$;

drop trigger if exists sessions_notify on public.sessions;
create trigger sessions_notify after insert or update on public.sessions
  for each row execute function public.on_session_change();

create or replace function public.on_review_created()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_enabled boolean := true;
begin
  select np.review_received into v_enabled from public.notification_preferences np where np.user_id = new.teacher_id;
  if v_enabled is null then v_enabled := true; end if;
  perform public.push_notification(new.teacher_id, 'review_received', 'নতুন রিভিউ', 'আপনি একটি নতুন রিভিউ পেয়েছেন।', '/dashboard', v_enabled);
  return new;
end; $$;

drop trigger if exists reviews_notify on public.reviews;
create trigger reviews_notify after insert on public.reviews
  for each row execute function public.on_review_created();

create or replace function public.on_verification_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_enabled boolean := true;
begin
  if new.verification_status is distinct from old.verification_status
     or new.education_verified is distinct from old.education_verified
     or new.identity_verified is distinct from old.identity_verified
     or new.trusted_tutor is distinct from old.trusted_tutor then
    select np.verification_update into v_enabled from public.notification_preferences np where np.user_id = new.id;
    if v_enabled is null then v_enabled := true; end if;
    perform public.push_notification(new.id, 'verification_update', 'ভেরিফিকেশন আপডেট', 'আপনার ভেরিফিকেশন স্ট্যাটাস আপডেট হয়েছে।', '/profile', v_enabled);
  end if;
  return new;
end; $$;

drop trigger if exists profiles_verification_notify on public.profiles;
create trigger profiles_verification_notify after update on public.profiles
  for each row execute function public.on_verification_change();

-- ============================================================================
-- 9. Row Level Security
-- ============================================================================
alter table public.sessions enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;
alter table public.notification_preferences enable row level security;

drop policy if exists "sessions_select_involved" on public.sessions;
create policy "sessions_select_involved" on public.sessions for select to authenticated
  using (auth.uid() = teacher_id or auth.uid() = student_id or public.is_admin()
    or exists (select 1 from public.tuitions t where t.id = sessions.tuition_id and t.poster_id = auth.uid()));
drop policy if exists "sessions_insert_teacher" on public.sessions;
create policy "sessions_insert_teacher" on public.sessions for insert to authenticated with check (auth.uid() = teacher_id or public.is_admin());
drop policy if exists "sessions_update_teacher" on public.sessions;
create policy "sessions_update_teacher" on public.sessions for update to authenticated
  using (auth.uid() = teacher_id or public.is_admin()) with check (auth.uid() = teacher_id or public.is_admin());
drop policy if exists "sessions_delete_teacher" on public.sessions;
create policy "sessions_delete_teacher" on public.sessions for delete to authenticated using (auth.uid() = teacher_id or public.is_admin());

drop policy if exists "conversations_select_own" on public.conversations;
create policy "conversations_select_own" on public.conversations for select to authenticated
  using (auth.uid() in (participant_a, participant_b) or public.is_admin());
drop policy if exists "conversations_insert_own" on public.conversations;
create policy "conversations_insert_own" on public.conversations for insert to authenticated
  with check (auth.uid() in (participant_a, participant_b));
drop policy if exists "conversations_update_own" on public.conversations;
create policy "conversations_update_own" on public.conversations for update to authenticated
  using (auth.uid() in (participant_a, participant_b) or public.is_admin());

drop policy if exists "messages_select_participant" on public.messages;
create policy "messages_select_participant" on public.messages for select to authenticated
  using (exists (select 1 from public.conversations c where c.id = messages.conversation_id
    and (c.participant_a = auth.uid() or c.participant_b = auth.uid())) or public.is_admin());
drop policy if exists "messages_insert_participant" on public.messages;
create policy "messages_insert_participant" on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and exists (select 1 from public.conversations c
    where c.id = messages.conversation_id and (c.participant_a = auth.uid() or c.participant_b = auth.uid())));
drop policy if exists "messages_update_participant" on public.messages;
create policy "messages_update_participant" on public.messages for update to authenticated
  using (exists (select 1 from public.conversations c where c.id = messages.conversation_id
    and (c.participant_a = auth.uid() or c.participant_b = auth.uid())))
  with check (exists (select 1 from public.conversations c where c.id = messages.conversation_id
    and (c.participant_a = auth.uid() or c.participant_b = auth.uid())));

drop policy if exists "reviews_select_published" on public.reviews;
create policy "reviews_select_published" on public.reviews for select to authenticated
  using (status = 'published' or reviewer_id = auth.uid() or teacher_id = auth.uid() or public.is_admin());
drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews for insert to authenticated with check (reviewer_id = auth.uid());
drop policy if exists "reviews_update_own" on public.reviews;
create policy "reviews_update_own" on public.reviews for update to authenticated
  using (reviewer_id = auth.uid() or public.is_admin()) with check (reviewer_id = auth.uid() or public.is_admin());
drop policy if exists "reviews_delete_admin" on public.reviews;
create policy "reviews_delete_admin" on public.reviews for delete to authenticated using (public.is_admin());

drop policy if exists "reports_select_own" on public.reports;
create policy "reports_select_own" on public.reports for select to authenticated using (reporter_id = auth.uid() or public.is_admin());
drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own" on public.reports for insert to authenticated with check (reporter_id = auth.uid());
drop policy if exists "reports_update_admin" on public.reports;
create policy "reports_update_admin" on public.reports for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "blocks_select_own" on public.blocks;
create policy "blocks_select_own" on public.blocks for select to authenticated using (blocker_id = auth.uid() or public.is_admin());
drop policy if exists "blocks_insert_own" on public.blocks;
create policy "blocks_insert_own" on public.blocks for insert to authenticated with check (blocker_id = auth.uid());
drop policy if exists "blocks_delete_own" on public.blocks;
create policy "blocks_delete_own" on public.blocks for delete to authenticated using (blocker_id = auth.uid() or public.is_admin());

drop policy if exists "notification_preferences_select_own" on public.notification_preferences;
create policy "notification_preferences_select_own" on public.notification_preferences for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "notification_preferences_update_own" on public.notification_preferences;
create policy "notification_preferences_update_own" on public.notification_preferences for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================================
-- 10. Privileges
-- ============================================================================
grant select, insert, update, delete on public.sessions to authenticated;
grant select, insert, update on public.conversations to authenticated;
grant select, insert, update on public.messages to authenticated;
grant select, insert, update, delete on public.reviews to authenticated;
grant select, insert, update on public.reports to authenticated;
grant select, insert, delete on public.blocks to authenticated;
grant select, update on public.notification_preferences to authenticated;

grant execute on function public.verification_tier(uuid) to anon, authenticated;
grant execute on function public.get_teacher_reputation(uuid) to anon, authenticated;
grant execute on function public.get_teacher_reviews(uuid, int, int) to anon, authenticated;
grant execute on function public.get_teacher_own_reviews(uuid) to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception when others then null;
end $$;
