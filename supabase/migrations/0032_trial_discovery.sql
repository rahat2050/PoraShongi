-- ============================================================================
-- PoraSathi (পড়াসাথী) — 0032: Free-demo (trial) discovery
-- ----------------------------------------------------------------------------
-- teacher_profiles.trial_available / trial_price কলাম 0009 ও 0016-এ যোগ হয়েছে,
-- কিন্তু search_teachers() সেগুলো রিটার্ন করত না — ফলে শিক্ষক কার্ডে "ফ্রি ডেমো"
-- ব্যাজ দেখানো বা ডেমো-only ফিল্টার করা যেত না।
--
-- এই migration:
--   1. search_teachers()-এ trial_available / trial_price কলাম যোগ করে;
--   2. নতুন p_trial প্যারামিটার যোগ করে (শুধু ডেমো-দানকারী শিক্ষক ফিল্টার);
--   3. home_feed()-এও একই কলাম দেয় যাতে হোমপেজের কার্ড মিলে যায়।
--
-- ⚠️ পুরোনো ১৫-প্যারামিটার signature drop করা হয় — নতুনটিতে ১৬টি প্যারামিটার।
-- Idempotent — safe to re-run.
-- Apply with: supabase db push
-- ============================================================================

-- পুরোনো signature সরানো (নতুনটিতে p_trial যোগ হয়েছে বলে overload তৈরি হবে)
drop function if exists public.search_teachers(
  text, text, text, text, double precision, double precision,
  double precision, text, text, int, numeric, boolean, text, int, int
);

create or replace function public.search_teachers(
  p_class text default null,
  p_subject text default null,
  p_district text default null,
  p_area text default null,
  p_lat double precision default null,
  p_lon double precision default null,
  p_max_distance_km double precision default null,
  p_mode text default null,
  p_gender text default null,
  p_min_experience int default null,
  p_min_rating numeric default null,
  p_verified boolean default null,
  p_sort text default 'relevance',
  p_page int default 1,
  p_page_size int default 12,
  p_trial boolean default null
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
  from public.teacher_profiles tp
  join public.profiles pr on pr.id = tp.id
  where pr.role = 'teacher'
    and pr.account_status = 'active'
    and public.is_teacher_profile_publishable(tp.id)
    and (p_class is null or tp.classes_taught @> array[p_class])
    and (p_subject is null or tp.subjects @> array[p_subject])
    and (p_district is null or lower(trim(coalesce(pr.district, ''))) = lower(trim(p_district)))
    and (p_area is null or lower(trim(coalesce(pr.area, ''))) = lower(trim(p_area)))
    and (p_mode is null or tp.teaching_mode = p_mode or tp.teaching_mode = 'both')
    and (p_gender is null or pr.gender = p_gender)
    and (p_min_experience is null or coalesce(tp.experience_years, 0) >= p_min_experience)
    and (p_min_rating is null or coalesce(tp.rating_avg, 0) >= p_min_rating)
    and (p_verified is null or p_verified = false or pr.verification_status = 'verified')
    and (p_trial is null or p_trial = false or tp.trial_available = true)
    and (
      p_max_distance_km is null
      or (
        p_lat is not null and p_lon is not null
        and pr.latitude is not null and pr.longitude is not null
        and public.distance_km(p_lat, p_lon, pr.latitude, pr.longitude) <= p_max_distance_km
      )
    );

  select coalesce(json_agg(x), '[]'::json) into v_results
  from (
    select
      tp.id,
      pr.full_name,
      pr.display_name,
      pr.avatar_url,
      pr.district,
      pr.area,
      pr.gender,
      pr.verification_status,
      pr.is_premium,
      pr.premium_until,
      tp.headline,
      tp.education,
      tp.institution,
      tp.subjects,
      tp.classes_taught,
      tp.experience_years,
      tp.teaching_mode,
      tp.teaching_area,
      tp.expected_salary,
      tp.available_days,
      tp.available_time,
      tp.bio,
      tp.rating_avg,
      tp.review_count,
      tp.trial_available,
      tp.trial_price,
      public.distance_between(p_lat, p_lon, pr.latitude, pr.longitude) as distance_km
    from public.teacher_profiles tp
    join public.profiles pr on pr.id = tp.id
    where pr.role = 'teacher'
      and pr.account_status = 'active'
      and public.is_teacher_profile_publishable(tp.id)
      and (p_class is null or tp.classes_taught @> array[p_class])
      and (p_subject is null or tp.subjects @> array[p_subject])
      and (p_district is null or lower(trim(coalesce(pr.district, ''))) = lower(trim(p_district)))
      and (p_area is null or lower(trim(coalesce(pr.area, ''))) = lower(trim(p_area)))
      and (p_mode is null or tp.teaching_mode = p_mode or tp.teaching_mode = 'both')
      and (p_gender is null or pr.gender = p_gender)
      and (p_min_experience is null or coalesce(tp.experience_years, 0) >= p_min_experience)
      and (p_min_rating is null or coalesce(tp.rating_avg, 0) >= p_min_rating)
      and (p_verified is null or p_verified = false or pr.verification_status = 'verified')
      and (p_trial is null or p_trial = false or tp.trial_available = true)
      and (
        p_max_distance_km is null
        or (
          p_lat is not null and p_lon is not null
          and pr.latitude is not null and pr.longitude is not null
          and public.distance_km(p_lat, p_lon, pr.latitude, pr.longitude) <= p_max_distance_km
        )
      )
    order by
      (pr.is_premium and (pr.premium_until is null or pr.premium_until > now())) desc,
      case when p_sort = 'nearest'
        then coalesce(public.distance_between(p_lat, p_lon, pr.latitude, pr.longitude), 999999)
      end asc,
      case when p_sort = 'rating' then coalesce(tp.rating_avg, 0) end desc,
      case when p_sort = 'experience' then coalesce(tp.experience_years, 0) end desc,
      case when p_sort = 'newest' then extract(epoch from tp.created_at) end desc,
      (pr.verification_status = 'verified') desc,
      coalesce(tp.rating_avg, 0) desc,
      coalesce(tp.experience_years, 0) desc
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

revoke all on function public.search_teachers(
  text, text, text, text, double precision, double precision,
  double precision, text, text, int, numeric, boolean, text, int, int, boolean
) from public;

grant execute on function public.search_teachers(
  text, text, text, text, double precision, double precision,
  double precision, text, text, int, numeric, boolean, text, int, int, boolean
) to anon, authenticated;

-- ============================================================================
-- home_feed — কার্ডে একই ব্যাজ দেখাতে trial + institution কলাম যোগ
-- ============================================================================
create or replace function public.home_feed(
  p_teachers int default 6,
  p_tuitions int default 0
)
returns json
language sql
stable
security definer
set search_path = public
as $$
  with publishable as (
    select
      tp.id,
      pr.full_name,
      pr.display_name,
      pr.avatar_url,
      pr.district,
      pr.area,
      pr.gender,
      pr.verification_status,
      pr.is_premium,
      pr.premium_until,
      tp.headline,
      tp.education,
      tp.institution,
      tp.subjects,
      tp.classes_taught,
      tp.experience_years,
      tp.teaching_mode,
      tp.teaching_area,
      tp.expected_salary,
      tp.available_days,
      tp.available_time,
      tp.bio,
      tp.rating_avg,
      tp.review_count,
      tp.trial_available,
      tp.trial_price,
      null::double precision as distance_km,
      tp.created_at
    from public.teacher_profiles tp
    join public.profiles pr on pr.id = tp.id
    where pr.role = 'teacher'
      and pr.account_status = 'active'
      and public.is_teacher_profile_publishable(tp.id)
  )
  select json_build_object(
    'teachers', coalesce((
      select json_agg(t) from (
        select * from publishable
        order by
          (is_premium and (premium_until is null or premium_until > now())) desc,
          (verification_status = 'verified') desc,
          coalesce(rating_avg, 0) desc,
          coalesce(experience_years, 0) desc
        limit least(coalesce(p_teachers, 6), 24)
      ) t
    ), '[]'::json),
    'featured_teachers', coalesce((
      select json_agg(t) from (
        select * from publishable
        where is_premium and (premium_until is null or premium_until > now())
        order by coalesce(rating_avg, 0) desc, coalesce(experience_years, 0) desc
        limit least(coalesce(p_teachers, 6), 24)
      ) t
    ), '[]'::json),
    'recent_teachers', coalesce((
      select json_agg(t) from (
        select * from publishable
        order by created_at desc
        limit least(coalesce(p_teachers, 6), 24)
      ) t
    ), '[]'::json),
    'tuitions', '[]'::json
  );
$$;

revoke all on function public.home_feed(int, int) from public;
grant execute on function public.home_feed(int, int) to anon, authenticated;
