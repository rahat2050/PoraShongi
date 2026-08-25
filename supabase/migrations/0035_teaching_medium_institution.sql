-- ============================================================================
-- PoraSathi (পড়াসাথী) — 0035: মাধ্যম, প্রতিষ্ঠান ফিল্টার ও পড়ানোর পরিসংখ্যান
-- ----------------------------------------------------------------------------
-- সমস্যা: প্রতিযোগীদের তিনটাতেই আছে, আমাদের নেই —
--   * মাধ্যমভিত্তিক খোঁজা (Bangla Medium / English Medium / O-A Level / মাদ্রাসা)
--     — Eudika-র /english-medium-tutors-in-bangladesh, /a-level-tutors-in-dhaka
--   * প্রতিষ্ঠানভিত্তিক খোঁজা (DU / BUET / Medical টিউটর) — Eudika + Tuition Media
--   * "X জন শিক্ষার্থী পড়িয়েছেন / Y টি ক্লাস" স্ট্যাট — Tuition Media
--
-- সমাধান:
--   ১. teacher_profiles-এ `medium` কলাম (আগে কলামই ছিল না)
--   ২. teacher_profiles-এ স্ব-ঘোষিত `students_taught` ও `classes_completed`
--   ৩. search_teachers-এ p_medium ও p_institution ফিল্টার
--   ৪. get_public_teacher ও search_teachers নতুন কলামগুলো রিটার্ন করে
--
-- সততা নোট: students_taught / classes_completed **শিক্ষকের নিজের ঘোষণা**, আমাদের
-- প্ল্যাটফর্মে মাপা নয়। তাই UI-তে "শিক্ষকের ঘোষণা" লেখা থাকে — Tuition Media-র
-- মতো নিছক সংখ্যা নয়। খালি (null) থাকলে UI-তে দেখানোই হয় না, শূন্য নয়।
--
-- Idempotent — safe to re-run.
-- Apply with: supabase db push
-- ============================================================================

-- ============================================================================
-- ১. নতুন কলাম
-- ============================================================================
alter table public.teacher_profiles
  add column if not exists medium text;

alter table public.teacher_profiles
  add column if not exists students_taught smallint;

alter table public.teacher_profiles
  add column if not exists classes_completed smallint;

-- পুরনো ডেটায় medium null থাকতে পারে, তাই check-এ null মেনে নিচ্ছি।
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'teacher_profiles_medium_check'
  ) then
    alter table public.teacher_profiles
      add constraint teacher_profiles_medium_check
      check (
        medium is null
        or medium in ('bangla', 'english', 'english_version', 'o_a_level', 'madrasa', 'other')
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'teacher_profiles_students_taught_check'
  ) then
    alter table public.teacher_profiles
      add constraint teacher_profiles_students_taught_check
      check (students_taught is null or (students_taught >= 0 and students_taught <= 9999));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'teacher_profiles_classes_completed_check'
  ) then
    alter table public.teacher_profiles
      add constraint teacher_profiles_classes_completed_check
      check (classes_completed is null or (classes_completed >= 0 and classes_completed <= 99999));
  end if;
end;
$$;

create index if not exists teacher_profiles_medium_idx
  on public.teacher_profiles (medium)
  where medium is not null;

-- প্রতিষ্ঠান ILIKE-এ খোঁজা হয়, তাই lower() expression index।
create index if not exists teacher_profiles_institution_lower_idx
  on public.teacher_profiles (lower(trim(institution)))
  where institution is not null;

-- ============================================================================
-- ২. search_teachers — p_medium ও p_institution যোগ
-- ----------------------------------------------------------------------------
-- পুরনো signature-টা drop করা হচ্ছে: সব প্যারামিটারের default থাকায় দুটো overload
-- একসাথে থাকলে named-argument কল ambiguous হয়ে যায়।
-- ============================================================================
drop function if exists public.search_teachers(
  text, text, text, text, double precision, double precision,
  double precision, text, text, int, numeric, boolean, text, int, int, boolean
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
  p_trial boolean default null,
  p_medium text default null,
  p_institution text default null
)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_offset int := greatest(coalesce(p_page, 1) - 1, 0) * least(coalesce(p_page_size, 12), 50);
  v_inst text := nullif(lower(trim(coalesce(p_institution, ''))), '');
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
    and (p_medium is null or tp.medium = p_medium)
    and (v_inst is null or lower(trim(coalesce(tp.institution, ''))) like '%' || v_inst || '%')
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
      tp.medium,
      tp.students_taught,
      tp.classes_completed,
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
      and (p_medium is null or tp.medium = p_medium)
      and (v_inst is null or lower(trim(coalesce(tp.institution, ''))) like '%' || v_inst || '%')
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
  double precision, text, text, int, numeric, boolean, text, int, int, boolean, text, text
) from public;

grant execute on function public.search_teachers(
  text, text, text, text, double precision, double precision,
  double precision, text, text, int, numeric, boolean, text, int, int, boolean, text, text
) to anon, authenticated;

-- ============================================================================
-- ৩. get_public_teacher — নতুন কলামগুলো পাবলিক প্রোফাইলে
-- ============================================================================
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
      tp.trial_available, tp.trial_price,
      tp.medium, tp.students_taught, tp.classes_completed,
      tp.created_at
    from public.teacher_profiles tp
    join public.profiles p on p.id = tp.id
    where tp.id = p_teacher_id
      and public.is_teacher_profile_publishable(tp.id)
  ) t;
$$;

revoke all on function public.get_public_teacher(uuid) from public;
grant execute on function public.get_public_teacher(uuid) to anon, authenticated;

-- ============================================================================
-- ৪. home_feed — কার্ডে মাধ্যম ও স্ট্যাট ব্যাজ দেখাতে
-- ----------------------------------------------------------------------------
-- বিদ্যমান (0032) সংস্করণের **হুবহু** কাঠামো রাখা হয়েছে — একই key, একই কলাম,
-- একই সর্টিং; শুধু তিনটি নতুন কলাম যোগ হয়েছে। অন্যথায় হোমপেজ ভেঙে যেত।
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
      tp.medium,
      tp.students_taught,
      tp.classes_completed,
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
