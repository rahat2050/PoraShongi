-- ============================================================================
-- PoraShongi — Phase 3 (follow-up): budget filter + teacher match opportunities
-- ----------------------------------------------------------------------------
-- 1. search_teachers v3 — adds a budget filter (max expected salary).
-- 2. match_tuitions_for_teacher — open tuitions matching a teacher's profile.
-- ----------------------------------------------------------------------------
-- Idempotent: safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Teacher discovery v3 (budget filter)
-- ---------------------------------------------------------------------------
drop function if exists public.search_teachers(text, text, text, int, text, boolean, text, text, numeric, text, uuid, int, int);

create or replace function public.search_teachers(
  p_class text default null,
  p_subject text default null,
  p_location text default null,
  p_min_experience int default null,
  p_max_salary numeric default null,
  p_mode text default null,
  p_verified boolean default null,
  p_sort text default 'relevance',
  p_gender text default null,
  p_min_rating numeric default null,
  p_available_day text default null,
  p_tuition_id uuid default null,
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
  t public.tuitions%rowtype;
begin
  if p_sort = 'best_match' and p_tuition_id is not null then
    select * into t from public.tuitions where id = p_tuition_id;
  end if;

  select count(*) into v_total
  from public.teacher_profiles tp
  join public.profiles p on p.id = tp.id
  where p.role = 'teacher'
    and p.account_status = 'active'
    and (p_class is null or tp.classes_taught @> array[p_class])
    and (p_subject is null or tp.subjects @> array[p_subject])
    and (p_location is null or coalesce(p.location, '') ilike '%' || p_location || '%')
    and (p_min_experience is null or coalesce(tp.experience_years, 0) >= p_min_experience)
    and (p_max_salary is null or coalesce(tp.expected_salary, 0) <= p_max_salary)
    and (p_mode is null or tp.teaching_mode = p_mode or tp.teaching_mode = 'both')
    and (p_verified is null or (p_verified = false) or (p_verified = true and p.verification_status = 'verified'))
    and (p_gender is null or p.gender = p_gender)
    and (p_min_rating is null or coalesce(tp.rating_avg, 0) >= p_min_rating)
    and (p_available_day is null or tp.available_days @> array[p_available_day])
    and not exists (select 1 from public.blocks b where b.blocker_id = auth.uid() and b.blocked_id = tp.id)
    and not exists (select 1 from public.blocks b where b.blocked_id = auth.uid() and b.blocker_id = tp.id);

  select coalesce(json_agg(x), '[]'::json)
  into v_results
  from (
    select
      tp.id, p.full_name, p.display_name, p.avatar_url, p.location, p.gender,
      p.verification_status, p.phone_verified, p.education_verified, p.identity_verified,
      p.trusted_tutor,
      tp.headline, tp.education, tp.institution, tp.qualifications, tp.subjects,
      tp.classes_taught, tp.experience_years, tp.teaching_mode, tp.teaching_area,
      tp.expected_salary, tp.available_days, tp.available_time, tp.bio,
      tp.rating_avg, tp.review_count,
      (p.verification_status = 'verified') as is_verified,
      public.verification_tier(p.id) as tier,
      tp.created_at,
      case
        when p_sort = 'best_match' and t.id is not null then
          public.compute_teacher_match(tp.id, t.class_level, t.subject, t.location, t.teaching_mode, t.budget, t.preferred_days)
        else 0
      end as match_score
    from public.teacher_profiles tp
    join public.profiles p on p.id = tp.id
    where p.role = 'teacher'
      and p.account_status = 'active'
      and (p_class is null or tp.classes_taught @> array[p_class])
      and (p_subject is null or tp.subjects @> array[p_subject])
      and (p_location is null or coalesce(p.location, '') ilike '%' || p_location || '%')
      and (p_min_experience is null or coalesce(tp.experience_years, 0) >= p_min_experience)
      and (p_max_salary is null or coalesce(tp.expected_salary, 0) <= p_max_salary)
      and (p_mode is null or tp.teaching_mode = p_mode or tp.teaching_mode = 'both')
      and (p_verified is null or (p_verified = false) or (p_verified = true and p.verification_status = 'verified'))
      and (p_gender is null or p.gender = p_gender)
      and (p_min_rating is null or coalesce(tp.rating_avg, 0) >= p_min_rating)
      and (p_available_day is null or tp.available_days @> array[p_available_day])
      and not exists (select 1 from public.blocks b where b.blocker_id = auth.uid() and b.blocked_id = tp.id)
      and not exists (select 1 from public.blocks b where b.blocked_id = auth.uid() and b.blocker_id = tp.id)
    order by
      case
        when p_sort = 'best_match' and t.id is not null then public.compute_teacher_match(tp.id, t.class_level, t.subject, t.location, t.teaching_mode, t.budget, t.preferred_days)
        else 0
      end desc,
      case when p_sort = 'rating' then coalesce(tp.rating_avg, 0) end desc,
      case when p_sort = 'experience' then coalesce(tp.experience_years, 0) end desc,
      case when p_sort = 'newest' then extract(epoch from tp.created_at) end desc,
      (p.verification_status = 'verified') desc,
      coalesce(tp.rating_avg, 0) desc,
      coalesce(tp.experience_years, 0) desc
    limit least(coalesce(p_page_size, 12), 50) offset v_offset
  ) x;

  return json_build_object(
    'total', v_total,
    'page', greatest(coalesce(p_page, 1), 1),
    'page_size', least(coalesce(p_page_size, 12), 50),
    'results', v_results
  );
end;
$$;

revoke all on function public.search_teachers(text, text, text, int, numeric, text, boolean, text, text, numeric, text, uuid, int, int) from public;
grant execute on function public.search_teachers(text, text, text, int, numeric, text, boolean, text, text, numeric, text, uuid, int, int) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Match opportunities for a teacher (open tuitions matching their profile)
-- ---------------------------------------------------------------------------
create or replace function public.match_tuitions_for_teacher(
  p_teacher_id uuid,
  p_limit int default 10
)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_total bigint;
  v_results json;
begin
  select count(*) into v_total
  from public.tuitions t
  join public.profiles po on po.id = t.poster_id
  join public.teacher_profiles tp on tp.id = p_teacher_id
  where t.status = 'open'
    and po.account_status = 'active'
    and (
      tp.subjects @> array[t.subject]
      or tp.classes_taught @> array[t.class_level]
    )
    and not exists (select 1 from public.blocks b where b.blocker_id = t.poster_id and b.blocked_id = p_teacher_id)
    and not exists (select 1 from public.blocks b where b.blocked_id = t.poster_id and b.blocker_id = p_teacher_id);

  select coalesce(json_agg(x order by x.score desc, x.created_at desc), '[]'::json)
  into v_results
  from (
    select
      t.id, t.title, t.class_level, t.subject, t.location, t.budget, t.teaching_mode,
      t.preferred_days, t.preferred_time, t.status, t.created_at,
      po.full_name as poster_name, po.display_name as poster_display_name, po.role as poster_role,
      public.compute_teacher_match(
        p_teacher_id, t.class_level, t.subject, t.location, t.teaching_mode, t.budget, t.preferred_days
      ) as score
    from public.tuitions t
    join public.profiles po on po.id = t.poster_id
    join public.teacher_profiles tp on tp.id = p_teacher_id
    where t.status = 'open'
      and po.account_status = 'active'
      and (
        tp.subjects @> array[t.subject]
        or tp.classes_taught @> array[t.class_level]
      )
      and not exists (select 1 from public.blocks b where b.blocker_id = t.poster_id and b.blocked_id = p_teacher_id)
      and not exists (select 1 from public.blocks b where b.blocked_id = t.poster_id and b.blocker_id = p_teacher_id)
    limit least(coalesce(p_limit, 10), 50)
  ) x;

  return json_build_object('total', v_total, 'results', v_results);
end;
$$;

revoke all on function public.match_tuitions_for_teacher(uuid, int) from public;
grant execute on function public.match_tuitions_for_teacher(uuid, int) to authenticated;
