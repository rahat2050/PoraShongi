-- ============================================================================
-- PoraSathi (পড়াসাথী) — 0010: batch/trial fields in public RPCs
-- ----------------------------------------------------------------------------
-- search_tuitions/get_public_tuition-এ batch info, get_public_teacher-এ trial
-- info যোগ। Idempotent.
-- ============================================================================

-- get_public_teacher — trial_available + trial_price যোগ
create or replace function public.get_public_teacher(p_teacher_id uuid)
returns json language sql stable security definer set search_path = public as $$
  select coalesce(row_to_json(t)::json, 'null'::json) from (
    select
      tp.id, p.full_name, p.display_name, p.avatar_url, p.gender,
      p.district, p.area, p.verification_status, p.is_premium, p.premium_until,
      tp.headline, tp.education, tp.institution, tp.qualifications, tp.subjects,
      tp.classes_taught, tp.experience_years, tp.teaching_mode, tp.teaching_area,
      tp.expected_salary, tp.available_days, tp.available_time, tp.bio,
      tp.rating_avg, tp.review_count, tp.profile_views,
      tp.trial_available, tp.trial_price, tp.created_at
    from public.teacher_profiles tp
    join public.profiles p on p.id = tp.id
    where tp.id = p_teacher_id
      and p.role = 'teacher'
      and p.account_status = 'active'
  ) t;
$$;

-- search_tuitions — batch info যোগ
create or replace function public.search_tuitions(
  p_class text default null, p_subject text default null,
  p_district text default null, p_area text default null,
  p_min_budget numeric default null, p_max_budget numeric default null,
  p_mode text default null, p_day text default null, p_time text default null,
  p_page int default 1, p_page_size int default 12)
returns json language plpgsql stable security definer set search_path = public as $$
declare
  v_offset int := greatest(coalesce(p_page,1)-1,0) * least(coalesce(p_page_size,12),50);
  v_total bigint; v_results json;
begin
  select count(*) into v_total
  from public.tuitions t join public.profiles po on po.id = t.poster_id
  where (p_class is null or t.class_level = p_class)
    and (p_subject is null or t.subject = p_subject)
    and (p_district is null or lower(coalesce(t.district,'')) = lower(p_district))
    and (p_area is null or lower(coalesce(t.area,'')) = lower(p_area))
    and (p_min_budget is null or coalesce(t.budget,0) >= p_min_budget)
    and (p_max_budget is null or coalesce(t.budget,0) <= p_max_budget)
    and (p_mode is null or t.teaching_mode = p_mode or t.teaching_mode = 'both')
    and (p_day is null or t.preferred_days @> array[p_day])
    and (p_time is null or coalesce(t.preferred_time,'') ilike '%' || p_time || '%');

  select coalesce(json_agg(x), '[]'::json) into v_results from (
    select t.id, t.title, t.class_level, t.subject, t.district, t.area, t.budget, t.budget_negotiable,
      t.teaching_mode, t.preferred_days, t.preferred_time, t.requirements, t.status, t.created_at,
      t.is_featured, t.featured_until, t.meeting_link,
      t.is_batch, t.batch_size, t.seats_filled,
      t.poster_id, po.full_name as poster_name, po.display_name as poster_display_name,
      po.role as poster_role, po.avatar_url as poster_avatar
    from public.tuitions t join public.profiles po on po.id = t.poster_id
    where (p_class is null or t.class_level = p_class)
      and (p_subject is null or t.subject = p_subject)
      and (p_district is null or lower(coalesce(t.district,'')) = lower(p_district))
      and (p_area is null or lower(coalesce(t.area,'')) = lower(p_area))
      and (p_min_budget is null or coalesce(t.budget,0) >= p_min_budget)
      and (p_max_budget is null or coalesce(t.budget,0) <= p_max_budget)
      and (p_mode is null or t.teaching_mode = p_mode or t.teaching_mode = 'both')
      and (p_day is null or t.preferred_days @> array[p_day])
      and (p_time is null or coalesce(t.preferred_time,'') ilike '%' || p_time || '%')
    order by
      (t.is_featured and (t.featured_until is null or t.featured_until > now())) desc,
      t.created_at desc
    limit least(coalesce(p_page_size,12),50) offset v_offset
  ) x;

  return json_build_object('total', v_total, 'page', greatest(coalesce(p_page,1),1),
    'page_size', least(coalesce(p_page_size,12),50), 'results', v_results);
end;
$$;

-- get_public_tuition — batch info যোগ
create or replace function public.get_public_tuition(p_tuition_id uuid)
returns json language sql stable security definer set search_path = public as $$
  select coalesce(row_to_json(t)::json, 'null'::json) from (
    select
      t.id, t.title, t.class_level, t.subject, t.district, t.area,
      t.budget, t.budget_negotiable, t.teaching_mode,
      t.preferred_days, t.preferred_time, t.requirements, t.status, t.created_at,
      t.is_featured, t.featured_until, t.meeting_link,
      t.is_batch, t.batch_size, t.seats_filled,
      t.poster_id, t.student_id,
      po.full_name as poster_name, po.display_name as poster_display_name,
      po.role as poster_role, po.avatar_url as poster_avatar
    from public.tuitions t
    join public.profiles po on po.id = t.poster_id
    where t.id = p_tuition_id
  ) t;
$$;
