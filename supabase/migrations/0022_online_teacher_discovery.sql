-- Publish complete online-capable teachers even when they have not added an
-- offline district yet. District filters remain strict, so these profiles only
-- appear in general/online discovery until a location is supplied.

create or replace function public.is_teacher_profile_publishable(p_teacher_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.teacher_profiles tp
    join public.profiles p on p.id = tp.id
    where tp.id = p_teacher_id
      and p.role = 'teacher'
      and p.account_status = 'active'
      and char_length(trim(coalesce(p.full_name, ''))) >= 2
      and cardinality(coalesce(tp.subjects, '{}'::text[])) > 0
      and cardinality(coalesce(tp.classes_taught, '{}'::text[])) > 0
      and char_length(trim(coalesce(tp.education, ''))) > 0
      and tp.teaching_mode in ('online', 'offline', 'both')
      and (
        tp.teaching_mode in ('online', 'both')
        or char_length(trim(coalesce(p.district, ''))) > 0
      )
  );
$$;

revoke all on function public.is_teacher_profile_publishable(uuid) from public;

create or replace function public.home_feed(p_teachers int default 6, p_tuitions int default 0)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_limit int := least(greatest(coalesce(p_teachers, 6), 1), 12);
  v_top json;
  v_featured json;
  v_recent json;
begin
  select coalesce(json_agg(x order by x.rating_avg desc, x.review_count desc), '[]'::json)
  into v_top
  from (
    select
      tp.id, p.full_name, p.display_name, p.avatar_url, p.gender, p.district, p.area,
      p.is_premium, p.premium_until, p.verification_status,
      tp.headline, tp.education, tp.subjects, tp.classes_taught,
      tp.experience_years, tp.teaching_mode, tp.teaching_area, tp.expected_salary,
      tp.available_days, tp.available_time, tp.bio, tp.rating_avg, tp.review_count,
      tp.created_at
    from public.teacher_profiles tp
    join public.profiles p on p.id = tp.id
    where public.is_teacher_profile_publishable(tp.id)
      and p.verification_status = 'verified'
      and coalesce(tp.review_count, 0) > 0
    order by tp.rating_avg desc, tp.review_count desc
    limit v_limit
  ) x;

  select coalesce(json_agg(x order by x.rating_avg desc, x.review_count desc), '[]'::json)
  into v_featured
  from (
    select
      tp.id, p.full_name, p.display_name, p.avatar_url, p.gender, p.district, p.area,
      p.is_premium, p.premium_until, p.verification_status,
      tp.headline, tp.education, tp.subjects, tp.classes_taught,
      tp.experience_years, tp.teaching_mode, tp.teaching_area, tp.expected_salary,
      tp.available_days, tp.available_time, tp.bio, tp.rating_avg, tp.review_count,
      tp.created_at
    from public.teacher_profiles tp
    join public.profiles p on p.id = tp.id
    where public.is_teacher_profile_publishable(tp.id)
      and p.verification_status = 'verified'
      and p.is_premium = true
      and (p.premium_until is null or p.premium_until > now())
    order by tp.rating_avg desc, tp.review_count desc
    limit v_limit
  ) x;

  select coalesce(json_agg(x order by x.created_at desc), '[]'::json)
  into v_recent
  from (
    select
      tp.id, p.full_name, p.display_name, p.avatar_url, p.gender, p.district, p.area,
      p.is_premium, p.premium_until, p.verification_status,
      tp.headline, tp.education, tp.subjects, tp.classes_taught,
      tp.experience_years, tp.teaching_mode, tp.teaching_area, tp.expected_salary,
      tp.available_days, tp.available_time, tp.bio, tp.rating_avg, tp.review_count,
      tp.created_at
    from public.teacher_profiles tp
    join public.profiles p on p.id = tp.id
    where public.is_teacher_profile_publishable(tp.id)
    order by tp.created_at desc
    limit v_limit
  ) x;

  return json_build_object(
    'teachers', v_top,
    'featured_teachers', v_featured,
    'recent_teachers', v_recent,
    'tuitions', '[]'::json
  );
end;
$$;

revoke all on function public.home_feed(int, int) from public;
grant execute on function public.home_feed(int, int) to anon, authenticated;
