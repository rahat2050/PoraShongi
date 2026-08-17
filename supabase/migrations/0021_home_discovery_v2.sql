-- Homepage discovery aggregates and curated teacher groups.

create or replace function public.site_stats()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_teachers bigint;
  v_students bigint;
  v_active_users bigint;
  v_verified_teachers bigint;
  v_open_tuitions bigint;
  v_successful_connections bigint;
  v_completed_tuitions bigint;
  v_reviews bigint;
  v_districts bigint;
  v_areas bigint;
  v_popular_subjects json;
  v_popular_classes json;
begin
  select count(*) into v_teachers
  from public.profiles where role = 'teacher' and account_status = 'active';

  select count(*) into v_students
  from public.profiles where role = 'student' and account_status = 'active';

  select count(*) into v_active_users
  from public.profiles where account_status = 'active';

  select count(*) into v_verified_teachers
  from public.profiles
  where role = 'teacher' and account_status = 'active' and verification_status = 'verified';

  select count(*) into v_open_tuitions
  from public.tuitions where status = 'open';

  select count(distinct tuition_id) into v_successful_connections
  from public.tuition_requests where status = 'accepted';

  select count(*) into v_completed_tuitions
  from public.tuitions where status = 'completed';

  select count(*) into v_reviews
  from public.reviews where status = 'published';

  select count(distinct district) into v_districts
  from public.profiles
  where account_status = 'active' and district is not null and trim(district) <> '';

  select count(distinct lower(trim(coalesce(district, ''))) || ':' || lower(trim(coalesce(area, ''))))
  into v_areas
  from public.profiles
  where account_status = 'active'
    and is_minor = false
    and district is not null
    and trim(district) <> ''
    and area is not null
    and trim(area) <> '';

  select coalesce(json_agg(x order by x.count desc, x.subject asc), '[]'::json)
  into v_popular_subjects
  from (
    select subject, count(*)::int as count
    from public.tuitions
    where status in ('open', 'assigned', 'completed')
    group by subject
    order by count desc, subject asc
    limit 8
  ) x;

  select coalesce(json_agg(x order by x.count desc, x.class_level asc), '[]'::json)
  into v_popular_classes
  from (
    select class_level, count(*)::int as count
    from public.tuitions
    where status in ('open', 'assigned', 'completed')
    group by class_level
    order by count desc, class_level asc
    limit 8
  ) x;

  return json_build_object(
    'teachers', v_teachers,
    'students', v_students,
    'active_users', v_active_users,
    'verified_teachers', v_verified_teachers,
    'open_tuitions', v_open_tuitions,
    'successful_connections', v_successful_connections,
    'completed_tuitions', v_completed_tuitions,
    'reviews', v_reviews,
    'districts', v_districts,
    'areas_covered', v_areas,
    'popular_subjects', v_popular_subjects,
    'popular_classes', v_popular_classes
  );
end;
$$;

revoke all on function public.site_stats() from public;
grant execute on function public.site_stats() to anon, authenticated;

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
      and p.verification_status = 'verified'
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
