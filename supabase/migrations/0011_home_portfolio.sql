-- ============================================================================
-- PoraSathi (পড়াসাথী) — 0011: Teacher portfolio + home feed
-- ----------------------------------------------------------------------------
-- 1. teacher_profiles-এ teaching_style + languages (blueprint #5)
-- 2. home_feed() — হোমপেজের জন্য top teachers + recent tuitions (anon-এ open,
--    শুধু public field, কোনো sensitive data নয়)
-- Idempotent — safe to re-run.
-- ============================================================================

-- 1. Teacher portfolio fields -------------------------------------------------
alter table public.teacher_profiles
  add column if not exists teaching_style text,
  add column if not exists languages text[];

-- get_public_teacher-এ নতুন field যোগ (আগের version replace)
create or replace function public.get_public_teacher(p_teacher_id uuid)
returns json language sql stable security definer set search_path = public as $$
  select coalesce(row_to_json(t)::json, 'null'::json) from (
    select
      tp.id, p.full_name, p.display_name, p.avatar_url, p.gender,
      p.district, p.area, p.verification_status, p.is_premium, p.premium_until,
      tp.headline, tp.education, tp.institution, tp.qualifications, tp.subjects,
      tp.classes_taught, tp.experience_years, tp.teaching_mode, tp.teaching_area,
      tp.expected_salary, tp.available_days, tp.available_time, tp.bio,
      tp.teaching_style, tp.languages,
      tp.rating_avg, tp.review_count, tp.profile_views,
      tp.trial_available, tp.trial_price, tp.created_at
    from public.teacher_profiles tp
    join public.profiles p on p.id = tp.id
    where tp.id = p_teacher_id
      and p.role = 'teacher'
      and p.account_status = 'active'
  ) t;
$$;

-- 2. home_feed() — হোমপেজের live content -------------------------------------
create or replace function public.home_feed(p_teachers int default 6, p_tuitions int default 6)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare v_teachers json; v_tuitions json;
begin
  select coalesce(json_agg(x order by x.rating_avg desc nulls last, x.review_count desc nulls last), '[]'::json)
  into v_teachers
  from (
    select
      tp.id, p.full_name, p.display_name, p.avatar_url, p.district, p.area,
      p.is_premium, p.verification_status,
      tp.subjects, tp.classes_taught, tp.experience_years,
      tp.rating_avg, tp.review_count, tp.teaching_mode
    from public.teacher_profiles tp
    join public.profiles p on p.id = tp.id
    where p.role = 'teacher' and p.account_status = 'active'
    order by tp.rating_avg desc nulls last, tp.review_count desc nulls last
    limit least(coalesce(p_teachers,6), 12)
  ) x;

  select coalesce(json_agg(x order by x.created_at desc), '[]'::json)
  into v_tuitions
  from (
    select
      t.id, t.title, t.class_level, t.subject, t.district, t.area,
      t.budget, t.teaching_mode, t.created_at
    from public.tuitions t
    where t.status = 'open'
    order by t.created_at desc
    limit least(coalesce(p_tuitions,6), 12)
  ) x;

  return json_build_object('teachers', v_teachers, 'tuitions', v_tuitions);
end;
$$;

revoke all on function public.home_feed(int, int) from public;
grant execute on function public.home_feed(int, int) to anon, authenticated;
