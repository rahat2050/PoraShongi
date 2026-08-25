-- ============================================================================
-- PoraSathi (পড়াসাথী) — 0036: ভিডিও টেস্টিমোনিয়াল (review-তে video_url)
-- ----------------------------------------------------------------------------
-- সমস্যা: Tuition Terminal-এর "Real Happy Parents, Real Stories"-তে YouTube-লিংক
-- করা অভিভাবক ভিডিও আছে; আমাদের ReviewSpotlight শুধু টেক্সট।
--
-- সমাধান: reviews-এ ঐচ্ছিক `video_url`। নিরাপত্তার জন্য শুধু একটি host
-- allowlist — youtube.com / youtu.be / vimeo.com, এবং অবশ্যই https।
-- এতে javascript:, data: বা যেকোনো থার্ড-পার্টি embed ঢুকতে পারে না।
--
-- UI-তে ভিডিও কখনো auto-play হয় না — শুধু থাম্বনেইল-স্টাইল লিংক (ক্লিক করলে
-- YouTube-এ খোলে)। ফলে কোনো থার্ড-পার্টি iframe আমাদের পেজে লোড হয় না,
-- আর কুকি/ট্র্যাকিংও বাড়ে না।
--
-- Idempotent — safe to re-run.
-- Apply with: supabase db push
-- ============================================================================

alter table public.reviews
  add column if not exists video_url text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'reviews_video_url_check'
  ) then
    alter table public.reviews
      add constraint reviews_video_url_check
      check (
        video_url is null
        or video_url ~ '^https://((www|m)\.)?(youtube\.com/(watch\?[^[:space:]]+|shorts/[A-Za-z0-9_-]{6,}|embed/[A-Za-z0-9_-]{6,})|youtu\.be/[A-Za-z0-9_-]{6,}|vimeo\.com/[0-9]{4,})'
      );
  end if;
end;
$$;

-- ============================================================================
-- get_teacher_reviews — পাবলিক রিভিউ তালিকায় video_url
-- ============================================================================
create or replace function public.get_teacher_reviews(
  p_teacher_id uuid,
  p_page int default 1,
  p_page_size int default 10
)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_offset int := greatest(coalesce(p_page,1)-1,0) * least(coalesce(p_page_size,10),50);
  v_total bigint;
  v_results json;
begin
  select count(*) into v_total from public.reviews r
  where r.teacher_id = p_teacher_id and r.status = 'published';

  select coalesce(json_agg(x order by x.created_at desc),'[]'::json) into v_results from (
    select r.id, r.rating, r.body, r.verified, r.video_url, r.created_at,
      p.full_name as reviewer_name, p.display_name as reviewer_display_name,
      p.avatar_url as reviewer_avatar, p.role as reviewer_role
    from public.reviews r join public.profiles p on p.id = r.reviewer_id
    where r.teacher_id = p_teacher_id and r.status = 'published'
    limit least(coalesce(p_page_size,10),50) offset v_offset
  ) x;

  return json_build_object('total', v_total, 'page', greatest(coalesce(p_page,1),1),
    'page_size', least(coalesce(p_page_size,10),50), 'results', v_results);
end;
$$;

revoke all on function public.get_teacher_reviews(uuid, int, int) from public;
grant execute on function public.get_teacher_reviews(uuid, int, int) to anon, authenticated;

-- ============================================================================
-- get_teacher_own_reviews — শিক্ষক নিজের রিভিউ দেখার সময়
-- ============================================================================
create or replace function public.get_teacher_own_reviews(p_teacher_id uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(json_agg(x order by x.created_at desc),'[]'::json) from (
    select r.id, r.rating, r.body, r.verified, r.video_url, r.status, r.created_at,
      p.full_name as reviewer_name, p.display_name as reviewer_display_name,
      p.avatar_url as reviewer_avatar
    from public.reviews r join public.profiles p on p.id = r.reviewer_id
    where r.teacher_id = p_teacher_id
  ) x;
$$;

revoke all on function public.get_teacher_own_reviews(uuid) from public;
grant execute on function public.get_teacher_own_reviews(uuid) to anon, authenticated;

-- ============================================================================
-- top_reviews — হোমপেজের review spotlight-এ
-- ============================================================================
create or replace function public.top_reviews(p_limit int default 6)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(json_agg(x order by x.verified desc, x.created_at desc), '[]'::json)
  from (
    select
      r.id,
      r.rating,
      r.body,
      r.verified,
      r.video_url,
      r.created_at,
      reviewer.full_name as reviewer_name,
      reviewer.display_name as reviewer_display_name,
      reviewer.avatar_url as reviewer_avatar,
      reviewer.role as reviewer_role,
      teacher.id as teacher_id,
      teacher.full_name as teacher_name,
      teacher.display_name as teacher_display_name
    from public.reviews r
    join public.profiles reviewer on reviewer.id = r.reviewer_id
    join public.teacher_profiles tp on tp.id = r.teacher_id
    join public.profiles teacher on teacher.id = tp.id
    where r.status = 'published'
      and r.body is not null
      and char_length(trim(r.body)) > 0
      and r.rating >= 4
      and public.is_teacher_profile_publishable(tp.id)
    order by r.verified desc, r.created_at desc
    limit least(coalesce(p_limit, 6), 12)
  ) x;
$$;

revoke all on function public.top_reviews(int) from public;
grant execute on function public.top_reviews(int) to anon, authenticated;
