-- Public profile quality and transparent reputation metrics.

-- Compatibility preflight: some early production projects were initialized
-- manually and do not have every 0006/0009/0011 portfolio column recorded in
-- migration history. These additions are idempotent and make this migration
-- safe for those databases as well as fully migrated projects.
alter table public.profiles
  add column if not exists is_premium boolean not null default false,
  add column if not exists premium_until timestamptz;

alter table public.teacher_profiles
  add column if not exists profile_views integer not null default 0,
  add column if not exists trial_available boolean not null default false,
  add column if not exists trial_price numeric default 0,
  add column if not exists teaching_style text,
  add column if not exists languages text[];

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
      and (tp.teaching_mode = 'online' or char_length(trim(coalesce(p.district, ''))) > 0)
  );
$$;

revoke all on function public.is_teacher_profile_publishable(uuid) from public;

-- Incomplete teacher profiles remain editable by their owners but are not
-- exposed by the anonymous public-profile RPC.
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
      and public.is_teacher_profile_publishable(tp.id)
  ) t;
$$;

revoke all on function public.get_public_teacher(uuid) from public;
grant execute on function public.get_public_teacher(uuid) to anon, authenticated;

-- Homepage only exposes publish-ready teachers. Tuition requirements are
-- private/login-gated, so they are not included in the anonymous feed.
create or replace function public.home_feed(p_teachers int default 6, p_tuitions int default 0)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_teachers json;
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
    where public.is_teacher_profile_publishable(tp.id)
    order by tp.rating_avg desc nulls last, tp.review_count desc nulls last
    limit least(coalesce(p_teachers, 6), 12)
  ) x;

  return json_build_object('teachers', v_teachers, 'tuitions', '[]'::json);
end;
$$;

revoke all on function public.home_feed(int, int) from public;
grant execute on function public.home_feed(int, int) to anon, authenticated;

-- Include the response-rate denominator so the UI never presents a percentage
-- without showing how much activity supports it.
create or replace function public.get_teacher_reputation(p_teacher_id uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(row_to_json(x)::json, 'null'::json)
  from (
    select
      p.verification_status,
      p.phone_verified,
      p.education_verified,
      p.identity_verified,
      p.trusted_tutor,
      public.verification_tier(p.id) as tier,
      coalesce(tp.rating_avg, 0) as rating_avg,
      coalesce(tp.review_count, 0) as review_count,
      (
        select count(*)
        from public.tuitions t
        join public.tuition_requests r on r.tuition_id = t.id
        where r.teacher_id = p.id
          and r.status = 'accepted'
          and t.status = 'completed'
      ) as completed_tuitions,
      (
        select count(*)
        from public.tuition_requests r
        where r.teacher_id = p.id
          and r.status in ('accepted', 'rejected')
      ) as response_count,
      coalesce((
        select round(
          100.0 * count(*) filter (where r.status = 'accepted')
          / nullif(count(*) filter (where r.status in ('accepted', 'rejected')), 0),
          0
        )
        from public.tuition_requests r
        where r.teacher_id = p.id
      ), 0) as response_rate,
      coalesce((
        select round(100.0 * count(*) filter (where s.status = 'cancelled') / nullif(count(*), 0), 0)
        from public.sessions s
        where s.teacher_id = p.id
      ), 0) as cancellation_rate,
      (
        select round(avg(extract(epoch from (r.responded_at - r.created_at)) / 3600)::numeric, 1)
        from public.tuition_requests r
        where r.teacher_id = p.id
          and r.status in ('accepted', 'rejected')
          and r.responded_at is not null
      ) as avg_response_hours
    from public.profiles p
    join public.teacher_profiles tp on tp.id = p.id
    where p.id = p_teacher_id
      and p.role = 'teacher'
  ) x;
$$;

revoke all on function public.get_teacher_reputation(uuid) from public;
grant execute on function public.get_teacher_reputation(uuid) to anon, authenticated;
