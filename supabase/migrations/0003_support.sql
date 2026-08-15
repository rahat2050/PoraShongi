-- ============================================================================
-- PoraSathi (পড়াসাথী) — FP2 support functions
-- ----------------------------------------------------------------------------
-- 0000_setup_complete.sql (বা 0001+0002) চালানোর পরে এটা চালাও।
-- Idempotent — safe to re-run.
-- ============================================================================

-- Public teacher profile (নিরাপদ field list — email/phone/lat/lng কখনো না)
create or replace function public.get_public_teacher(p_teacher_id uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(row_to_json(t)::json, 'null'::json)
  from (
    select
      tp.id, p.full_name, p.display_name, p.avatar_url, p.gender,
      p.district, p.area, p.verification_status,
      tp.headline, tp.education, tp.institution, tp.qualifications, tp.subjects,
      tp.classes_taught, tp.experience_years, tp.teaching_mode, tp.teaching_area,
      tp.expected_salary, tp.available_days, tp.available_time, tp.bio,
      tp.rating_avg, tp.review_count, tp.created_at
    from public.teacher_profiles tp
    join public.profiles p on p.id = tp.id
    where tp.id = p_teacher_id
      and p.role = 'teacher'
      and p.account_status = 'active'
  ) t;
$$;

-- Public teacher summaries by ids (favorites / saved teachers)
create or replace function public.get_public_teachers(p_ids uuid[])
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(json_agg(t order by t.full_name asc), '[]'::json)
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
      and p.role = 'teacher'
      and p.account_status = 'active'
  ) t;
$$;

-- Public tuition detail
create or replace function public.get_public_tuition(p_tuition_id uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(row_to_json(t)::json, 'null'::json)
  from (
    select
      t.id, t.title, t.class_level, t.subject, t.district, t.area,
      t.budget, t.budget_negotiable, t.teaching_mode,
      t.preferred_days, t.preferred_time, t.requirements, t.status, t.created_at,
      t.poster_id, t.student_id,
      po.full_name as poster_name, po.display_name as poster_display_name,
      po.role as poster_role, po.avatar_url as poster_avatar
    from public.tuitions t
    join public.profiles po on po.id = t.poster_id
    where t.id = p_tuition_id
  ) t;
$$;

-- Minimal public profile info by ids (request rows / names)
-- শিশু (is_minor) হলে location (district/area) দেখাবে না — child safety
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
      p.id, p.full_name, p.display_name, p.role, p.avatar_url, p.gender,
      case when p.is_minor then null else p.district end as district,
      case when p.is_minor then null else p.area end as area
    from public.profiles p
    where p.id = any (p_ids)
  ) t;
$$;

-- Student directory (guardian linking)
create or replace function public.list_students()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(json_agg(t order by t.full_name asc), '[]'::json)
  from (
    select p.id, p.full_name, p.display_name,
      case when p.is_minor then null else p.district end as district,
      case when p.is_minor then null else p.area end as area
    from public.profiles p
    where p.role = 'student' and p.account_status = 'active'
  ) t;
$$;

-- Privileges
revoke all on function public.get_public_teacher(uuid) from public;
revoke all on function public.get_public_teachers(uuid[]) from public;
revoke all on function public.get_public_tuition(uuid) from public;
revoke all on function public.get_profiles_public(uuid[]) from public;
revoke all on function public.list_students() from public;

grant execute on function public.get_public_teacher(uuid) to anon, authenticated;
grant execute on function public.get_public_teachers(uuid[]) to anon, authenticated;
grant execute on function public.get_public_tuition(uuid) to authenticated;
grant execute on function public.get_profiles_public(uuid[]) to authenticated;
grant execute on function public.list_students() to authenticated;
