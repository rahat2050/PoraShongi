-- ============================================================================
-- PoraSathi (পড়াসাথী) — 0037: Tutor Gigs (শিক্ষকের fixed-price প্যাকেজ)
-- ----------------------------------------------------------------------------
-- সমস্যা: আমাদের মডেল সম্পূর্ণ "টিউশন পোস্ট → শিক্ষক আবেদন করে"। শিক্ষক নিজে
-- থেকে কোনো **অফার** করতে পারেন না। Tuition Media-র `tutor_gigs.php`-তে শিক্ষক
-- নিজের প্যাকেজ বানান ("IELTS Prep — ৳৫০০/hr") — এটা সরবরাহ-চালিত একটি আলাদা
-- রেভিনিউ চ্যানেল, আর Google-এও ইনডেক্স হয়।
--
-- সমাধান:
--   * `tutor_gigs` টেবিল — শিক্ষক নিজে তৈরি/সম্পাদনা/মুছে ফেলতে পারেন (RLS)
--   * পাবলিক পড়া শুধু SECURITY DEFINER RPC দিয়ে, এবং শুধু তখনই যখন
--       - gig status = 'published'
--       - শিক্ষকের প্রোফাইল প্রকাশযোগ্য (is_teacher_profile_publishable)
--       - শিক্ষকের অ্যাকাউন্ট active
--     ফলে draft/hidden gig কখনো ফাঁস হয় না।
--   * admin যেকোনো gig দেখতে/লুকাতে পারেন (moderation)
--
-- দাম: প্যাকেজ-মূল্য (মোট), প্রতি ঘণ্টা নয় — কারণ আমাদের বাকি সব জায়গায়
-- মাসিক/প্যাকেজ দামই ব্যবহার হয়। `sessions_per_week` ও `duration_weeks` থেকে
-- UI মোট ক্লাস সংখ্যা দেখায়।
--
-- Idempotent — safe to re-run.
-- Apply with: supabase db push
-- ============================================================================

create table if not exists public.tutor_gigs (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null,
  subjects text[] not null default '{}',
  class_levels text[] not null default '{}',
  teaching_mode text not null default 'online',
  duration_weeks smallint not null default 4,
  sessions_per_week smallint not null default 2,
  price integer not null,
  includes_trial boolean not null default false,
  status text not null default 'draft',
  is_flagged boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tutor_gigs_status_check
    check (status in ('draft', 'published', 'hidden', 'removed')),
  constraint tutor_gigs_mode_check
    check (teaching_mode in ('online', 'offline', 'both')),
  constraint tutor_gigs_title_check
    check (char_length(trim(title)) between 4 and 120),
  constraint tutor_gigs_description_check
    check (char_length(trim(description)) between 20 and 2000),
  constraint tutor_gigs_price_check
    check (price >= 0 and price <= 5000000),
  constraint tutor_gigs_duration_check
    check (duration_weeks between 1 and 104),
  constraint tutor_gigs_sessions_check
    check (sessions_per_week between 1 and 14)
);

create index if not exists tutor_gigs_teacher_idx
  on public.tutor_gigs (teacher_id, created_at desc);
create index if not exists tutor_gigs_public_idx
  on public.tutor_gigs (status, created_at desc)
  where status = 'published';
create index if not exists tutor_gigs_subjects_idx
  on public.tutor_gigs using gin (subjects);

alter table public.tutor_gigs enable row level security;

-- ============================================================================
-- RLS
-- ----------------------------------------------------------------------------
-- লেখা: শুধু মালিক (নিজের gig) বা admin।
-- পড়া: মালিক (নিজের সব gig, draft সহ) বা admin।
-- anon/authenticated অন্যের gig সরাসরি পড়তে পারে না — পাবলিক তালিকা RPC দিয়ে।
-- ============================================================================
drop policy if exists "tutor_gigs owner read" on public.tutor_gigs;
create policy "tutor_gigs owner read"
  on public.tutor_gigs for select
  using (
    (auth.uid() is not null and teacher_id = auth.uid())
    or public.is_admin()
  );

drop policy if exists "tutor_gigs owner insert" on public.tutor_gigs;
create policy "tutor_gigs owner insert"
  on public.tutor_gigs for insert
  with check (auth.uid() is not null and teacher_id = auth.uid());

drop policy if exists "tutor_gigs owner update" on public.tutor_gigs;
create policy "tutor_gigs owner update"
  on public.tutor_gigs for update
  using (
    (auth.uid() is not null and teacher_id = auth.uid())
    or public.is_admin()
  )
  with check (
    (auth.uid() is not null and teacher_id = auth.uid())
    or public.is_admin()
  );

drop policy if exists "tutor_gigs owner delete" on public.tutor_gigs;
create policy "tutor_gigs owner delete"
  on public.tutor_gigs for delete
  using (auth.uid() is not null and teacher_id = auth.uid());

-- ============================================================================
-- public_gigs_search — anon-callable, শুধু published + প্রকাশযোগ্য শিক্ষক
-- ----------------------------------------------------------------------------
-- যে কলামগুলো ইচ্ছাকৃতভাবে বাদ: is_flagged (মডারেশন তথ্য পাবলিক নয়)।
-- ============================================================================
create or replace function public.public_gigs_search(
  p_subject text default null,
  p_class text default null,
  p_mode text default null,
  p_max_price numeric default null,
  p_district text default null,
  p_sort text default 'newest',
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
  from public.tutor_gigs g
  join public.profiles pr on pr.id = g.teacher_id
  where g.status = 'published'
    and pr.account_status = 'active'
    and public.is_teacher_profile_publishable(g.teacher_id)
    and (p_subject is null or g.subjects @> array[p_subject])
    and (p_class is null or g.class_levels @> array[p_class])
    and (p_mode is null or g.teaching_mode = p_mode or g.teaching_mode = 'both')
    and (p_max_price is null or g.price <= p_max_price)
    and (p_district is null or lower(trim(coalesce(pr.district, ''))) = lower(trim(p_district)));

  select coalesce(json_agg(x), '[]'::json) into v_results
  from (
    select
      g.id,
      g.teacher_id,
      g.title,
      g.description,
      g.subjects,
      g.class_levels,
      g.teaching_mode,
      g.duration_weeks,
      g.sessions_per_week,
      g.price,
      g.includes_trial,
      g.created_at,
      g.updated_at,
      pr.display_name as teacher_display_name,
      pr.full_name as teacher_full_name,
      pr.avatar_url as teacher_avatar,
      pr.district as teacher_district,
      pr.area as teacher_area,
      pr.verification_status as teacher_verification_status,
      tp.institution as teacher_institution,
      tp.rating_avg as teacher_rating_avg,
      tp.review_count as teacher_review_count
    from public.tutor_gigs g
    join public.profiles pr on pr.id = g.teacher_id
    join public.teacher_profiles tp on tp.id = g.teacher_id
    where g.status = 'published'
      and pr.account_status = 'active'
      and public.is_teacher_profile_publishable(g.teacher_id)
      and (p_subject is null or g.subjects @> array[p_subject])
      and (p_class is null or g.class_levels @> array[p_class])
      and (p_mode is null or g.teaching_mode = p_mode or g.teaching_mode = 'both')
      and (p_max_price is null or g.price <= p_max_price)
      and (p_district is null or lower(trim(coalesce(pr.district, ''))) = lower(trim(p_district)))
    order by
      case when p_sort = 'price_low' then g.price end asc,
      case when p_sort = 'price_high' then g.price end desc,
      case when p_sort = 'rating' then coalesce(tp.rating_avg, 0) end desc,
      extract(epoch from g.created_at) desc
    limit least(coalesce(p_page_size, 12), 50)
    offset v_offset
  ) x;

  return json_build_object(
    'total', v_total,
    'page', greatest(coalesce(p_page, 1), 1),
    'page_size', least(coalesce(p_page_size, 12), 50),
    'results', v_results
  );
end;
$$;

revoke all on function public.public_gigs_search(
  text, text, text, numeric, text, text, int, int
) from public;
grant execute on function public.public_gigs_search(
  text, text, text, numeric, text, text, int, int
) to anon, authenticated;

-- ============================================================================
-- get_public_gig — একক gig বিস্তারিত (একই প্রকাশ-শর্ত)
-- ============================================================================
create or replace function public.get_public_gig(p_gig_id uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(row_to_json(t)::json, 'null'::json)
  from (
    select
      g.id,
      g.teacher_id,
      g.title,
      g.description,
      g.subjects,
      g.class_levels,
      g.teaching_mode,
      g.duration_weeks,
      g.sessions_per_week,
      g.price,
      g.includes_trial,
      g.created_at,
      g.updated_at,
      pr.display_name as teacher_display_name,
      pr.full_name as teacher_full_name,
      pr.avatar_url as teacher_avatar,
      pr.district as teacher_district,
      pr.area as teacher_area,
      pr.verification_status as teacher_verification_status,
      tp.institution as teacher_institution,
      tp.headline as teacher_headline,
      tp.experience_years as teacher_experience_years,
      tp.rating_avg as teacher_rating_avg,
      tp.review_count as teacher_review_count
    from public.tutor_gigs g
    join public.profiles pr on pr.id = g.teacher_id
    join public.teacher_profiles tp on tp.id = g.teacher_id
    where g.id = p_gig_id
      and g.status = 'published'
      and pr.account_status = 'active'
      and public.is_teacher_profile_publishable(g.teacher_id)
  ) t;
$$;

revoke all on function public.get_public_gig(uuid) from public;
grant execute on function public.get_public_gig(uuid) to anon, authenticated;

-- ============================================================================
-- list_my_gigs — শিক্ষকের নিজের gig তালিকা (draft সহ)
-- ============================================================================
create or replace function public.list_my_gigs()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(json_agg(x order by x.created_at desc), '[]'::json)
  from (
    select g.*
    from public.tutor_gigs g
    where g.teacher_id = auth.uid()
  ) x;
$$;

revoke all on function public.list_my_gigs() from public;
grant execute on function public.list_my_gigs() to authenticated;
