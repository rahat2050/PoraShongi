-- ============================================================================
-- PoraSathi (পড়াসাথী) — 0009: Batch tuition, Trial, Blog, Leaderboard,
--                              Recommendation, Admin analytics
-- ----------------------------------------------------------------------------
-- সব ডাটা minimal: batch/trial ছোট টেবিল, leaderboard/analytics/recommend
-- count/join ভিত্তিক RPC (নতুন ডাটা write করে না), blog শুধু text।
-- Idempotent — safe to re-run.
-- ============================================================================

-- ============================================================================
-- 1. Batch tuition (tuitions-এ flag + seat count)
-- ============================================================================
alter table public.tuitions
  add column if not exists is_batch boolean not null default false,
  add column if not exists batch_size int check (batch_size is null or batch_size between 2 and 200),
  add column if not exists seats_filled int not null default 0;

-- batch-এ join হওয়া student
create table if not exists public.batch_members (
  id uuid primary key default gen_random_uuid(),
  tuition_id uuid not null references public.tuitions (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint batch_members_unique unique (tuition_id, student_id)
);

create index if not exists batch_members_tuition_idx on public.batch_members (tuition_id);

-- ============================================================================
-- 2. Trial class (teacher offer + student request)
-- ============================================================================
alter table public.teacher_profiles
  add column if not exists trial_available boolean not null default false,
  add column if not exists trial_price numeric default 0;

create table if not exists public.trial_requests (
  id uuid primary key default gen_random_uuid(),
  tuition_id uuid references public.tuitions (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  message text,
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create index if not exists trial_requests_teacher_idx on public.trial_requests (teacher_id, created_at desc);
create unique index if not exists trial_requests_active_unique
  on public.trial_requests (sender_id, teacher_id) where status = 'pending';

-- ============================================================================
-- 3. Blog (SEO-র জন্য — শুধু text)
-- ============================================================================
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles (id) on delete set null,
  title text not null check (char_length(title) between 3 and 160),
  slug text not null unique,
  excerpt text,
  content text not null,
  category text not null default 'study_tips',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_published_idx on public.blog_posts (published, created_at desc);
create index if not exists blog_posts_category_idx on public.blog_posts (category);

-- ============================================================================
-- 4. Leaderboard — district অনুযায়ী top teacher (computed, কোনো write নেই)
-- ============================================================================
create or replace function public.top_teachers(p_district text default null, p_limit int default 10)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare v_results json;
begin
  select coalesce(json_agg(x order by x.leaderboard_score desc), '[]'::json)
  into v_results
  from (
    select
      tp.id, p.full_name, p.display_name, p.avatar_url, p.district, p.area,
      p.is_premium, p.verification_status,
      tp.subjects, tp.classes_taught, tp.experience_years,
      tp.rating_avg, tp.review_count,
      (select count(*) from public.tuitions t
        join public.tuition_requests r on r.tuition_id = t.id
        where r.teacher_id = tp.id and r.status='accepted' and t.status='completed') as completed_tuitions,
      -- leaderboard score: rating*20 + completed*10 + review_count*2 (transparent)
      (coalesce(tp.rating_avg,0)*20 + (select count(*) from public.tuitions t
        join public.tuition_requests r on r.tuition_id = t.id
        where r.teacher_id = tp.id and r.status='accepted' and t.status='completed')*10
        + coalesce(tp.review_count,0)*2) as leaderboard_score
    from public.teacher_profiles tp
    join public.profiles p on p.id = tp.id
    where p.role = 'teacher' and p.account_status = 'active'
      and (p_district is null or lower(coalesce(p.district,'')) = lower(p_district))
    order by leaderboard_score desc
    limit least(coalesce(p_limit,10), 50)
  ) x;
  return v_results;
end;
$$;

-- ============================================================================
-- 5. Recommendation — "এই teacher-এর মতো আরও" (same subject+location)
-- ============================================================================
create or replace function public.recommend_teachers(p_teacher_id uuid, p_limit int default 4)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare v_results json;
begin
  select coalesce(json_agg(x order by x.rating_avg desc nulls last), '[]'::json)
  into v_results
  from (
    select distinct
      tp2.id, p2.full_name, p2.display_name, p2.avatar_url, p2.district, p2.area,
      p2.is_premium, p2.verification_status,
      tp2.subjects, tp2.classes_taught, tp2.experience_years, tp2.rating_avg, tp2.review_count
    from public.teacher_profiles tp
    join public.profiles p on p.id = tp.id
    join public.teacher_profiles tp2 on tp2.id <> tp.id
    join public.profiles p2 on p2.id = tp2.id
    where tp.id = p_teacher_id
      and p2.role = 'teacher' and p2.account_status = 'active'
      and (
        -- একই subject বা একই এলাকার teacher
        (tp.subjects is not null and tp2.subjects is not null and tp.subjects && tp2.subjects)
        or (p.district is not null and p2.district = p.district)
      )
    order by tp2.rating_avg desc nulls last
    limit least(coalesce(p_limit,4), 20)
  ) x;
  return v_results;
end;
$$;

-- ============================================================================
-- 6. Admin analytics (count-ভিত্তিক, নতুন write নেই)
-- ============================================================================
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

-- ============================================================================
-- 7. Notification preference-এ email flag (ভবিষ্যৎ email notify-র জন্য)
-- ============================================================================
alter table public.notification_preferences
  add column if not exists email_notify boolean not null default false;

-- ============================================================================
-- 8. RLS + privileges
-- ============================================================================
alter table public.batch_members enable row level security;
alter table public.trial_requests enable row level security;
alter table public.blog_posts enable row level security;

-- batch members: poster/tuition owner + নিজে দেখতে, student join
drop policy if exists "batch_members_select" on public.batch_members;
create policy "batch_members_select" on public.batch_members
  for select to authenticated
  using (auth.uid() = student_id or public.is_admin()
    or exists (select 1 from public.tuitions t where t.id = batch_members.tuition_id and t.poster_id = auth.uid()));
drop policy if exists "batch_members_insert_own" on public.batch_members;
create policy "batch_members_insert_own" on public.batch_members
  for insert to authenticated with check (auth.uid() = student_id);

-- trial: sender/teacher দেখবে, sender পাঠাবে, teacher respond
drop policy if exists "trial_requests_select" on public.trial_requests;
create policy "trial_requests_select" on public.trial_requests
  for select to authenticated using (auth.uid() = sender_id or auth.uid() = teacher_id or public.is_admin());
drop policy if exists "trial_requests_insert" on public.trial_requests;
create policy "trial_requests_insert" on public.trial_requests
  for insert to authenticated with check (auth.uid() = sender_id);
drop policy if exists "trial_requests_update" on public.trial_requests;
create policy "trial_requests_update" on public.trial_requests
  for update to authenticated using (auth.uid() = teacher_id) with check (auth.uid() = teacher_id);

-- blog: published সবাই, author/admin manage
drop policy if exists "blog_select_published" on public.blog_posts;
create policy "blog_select_published" on public.blog_posts
  for select to authenticated using (published = true or auth.uid() = author_id or public.is_admin());
drop policy if exists "blog_insert_author" on public.blog_posts;
create policy "blog_insert_author" on public.blog_posts
  for insert to authenticated with check (auth.uid() = author_id or public.is_admin());
drop policy if exists "blog_update_author" on public.blog_posts;
create policy "blog_update_author" on public.blog_posts
  for update to authenticated using (auth.uid() = author_id or public.is_admin()) with check (auth.uid() = author_id or public.is_admin());

grant select, insert, delete on public.batch_members to authenticated;
grant select, insert, update on public.trial_requests to authenticated;
grant select, insert, update on public.blog_posts to authenticated;

grant execute on function public.top_teachers(text, int) to anon, authenticated;
grant execute on function public.recommend_teachers(uuid, int) to anon, authenticated;
grant execute on function public.admin_analytics() to authenticated;
