-- Homepage review spotlight.
--
-- The homepage now surfaces real, published reviews (with a body) from
-- publish-ready teachers as a rotating social-proof section. Reviews are the
-- same public content already shown on teacher profiles via
-- get_teacher_reviews(); this RPC just aggregates the freshest, positive ones
-- across teachers so the anonymous homepage can show them without any
-- fake/seed data.
--
-- Privacy: only reviewers of publishable teachers are exposed, using the same
-- display fields (name/avatar/role) already returned publicly by
-- get_teacher_reviews. Minors posting tuitions are not surfaced here because
-- the spotlight is scoped to teacher reviews.
--
-- Apply with: supabase db push (or run this file in the SQL editor).

create or replace function public.top_reviews(p_limit int default 6)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(json_agg(x order by x.verified desc, x.created_at desc), '[]'::json)
  from (
    select
      r.id,
      r.rating,
      r.body,
      r.verified,
      r.created_at,
      reviewer.full_name as reviewer_name,
      reviewer.display_name as reviewer_display_name,
      reviewer.avatar_url as reviewer_avatar,
      reviewer.role as reviewer_role,
      teacher.id as teacher_id,
      teacher.full_name as teacher_name,
      teacher.display_name as teacher_display_name
    from public.reviews r
    join public.profiles reviewer on reviewer.id = r.reviewer_id
    join public.teacher_profiles tp on tp.id = r.teacher_id
    join public.profiles teacher on teacher.id = tp.id
    where r.status = 'published'
      and r.body is not null
      and char_length(trim(r.body)) > 0
      and r.rating >= 4
      and public.is_teacher_profile_publishable(tp.id)
    order by r.verified desc, r.created_at desc
    limit least(coalesce(p_limit, 6), 12)
  ) x;
$$;

revoke all on function public.top_reviews(int) from public;
grant execute on function public.top_reviews(int) to anon, authenticated;
