-- Only rank teachers when there is enough verified evidence to support a
-- "best teacher" claim. Zero-activity and unverified profiles stay searchable
-- but are not awarded a leaderboard medal.

create or replace function public.top_teachers(p_district text default null, p_limit int default 10)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_results json;
begin
  select coalesce(json_agg(x order by x.leaderboard_score desc), '[]'::json)
  into v_results
  from (
    select
      tp.id,
      p.full_name,
      p.display_name,
      p.avatar_url,
      p.district,
      p.area,
      p.is_premium,
      p.verification_status,
      tp.subjects,
      tp.classes_taught,
      tp.experience_years,
      tp.rating_avg,
      tp.review_count,
      activity.completed_tuitions,
      (
        coalesce(tp.rating_avg, 0) * 20
        + activity.completed_tuitions * 10
        + coalesce(tp.review_count, 0) * 2
      ) as leaderboard_score
    from public.teacher_profiles tp
    join public.profiles p on p.id = tp.id
    cross join lateral (
      select count(*)::int as completed_tuitions
      from public.tuitions t
      join public.tuition_requests r on r.tuition_id = t.id
      where r.teacher_id = tp.id
        and r.status = 'accepted'
        and t.status = 'completed'
    ) activity
    where p.role = 'teacher'
      and p.account_status = 'active'
      and p.verification_status = 'verified'
      and coalesce(tp.review_count, 0) >= 3
      and activity.completed_tuitions >= 1
      and (p_district is null or lower(trim(coalesce(p.district, ''))) = lower(trim(p_district)))
    order by leaderboard_score desc
    limit least(coalesce(p_limit, 10), 50)
  ) x;

  return v_results;
end;
$$;

revoke all on function public.top_teachers(text, int) from public;
grant execute on function public.top_teachers(text, int) to anon, authenticated;
