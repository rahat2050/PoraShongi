-- Null-safe authorization guards for SECURITY DEFINER RPCs.
-- SQL comparisons with auth.uid() return NULL for anonymous callers, so every
-- guard must explicitly reject a missing UID instead of relying on <> alone.

create or replace function public.list_students()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  select role::text into v_role from public.profiles where id = auth.uid();
  if v_role is distinct from 'guardian' and not public.is_admin() then
    raise exception 'Only guardians can list linkable students.' using errcode = '42501';
  end if;

  return (
    select coalesce(json_agg(x order by x.full_name asc), '[]'::json)
    from (
      select p.id, p.full_name, p.display_name,
        case when p.is_minor then null else p.district end as district,
        case when p.is_minor then null else p.area end as area
      from public.profiles p
      where p.role = 'student'
        and p.account_status = 'active'
        and p.guardian_consent = true
    ) x
  );
end;
$$;

revoke all on function public.list_students() from public, anon;
grant execute on function public.list_students() to authenticated;

create or replace function public.get_teacher_own_reviews(p_teacher_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  if auth.uid() is distinct from p_teacher_id and not public.is_admin() then
    raise exception 'Not authorized to view private review moderation data.' using errcode = '42501';
  end if;

  return (
    select coalesce(json_agg(x order by x.created_at desc), '[]'::json)
    from (
      select r.id, r.rating, r.body, r.verified, r.status, r.created_at,
        p.full_name as reviewer_name,
        p.display_name as reviewer_display_name,
        p.avatar_url as reviewer_avatar
      from public.reviews r
      join public.profiles p on p.id = r.reviewer_id
      where r.teacher_id = p_teacher_id
    ) x
  );
end;
$$;

revoke all on function public.get_teacher_own_reviews(uuid) from public, anon;
grant execute on function public.get_teacher_own_reviews(uuid) to authenticated;

create or replace function public.match_tuitions_for_teacher_rpc(
  p_teacher_id uuid,
  p_limit int default 10
)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  if auth.uid() is distinct from p_teacher_id and not public.is_admin() then
    raise exception 'Not authorized to match for another teacher.' using errcode = '42501';
  end if;

  return public.match_tuitions_for_teacher(
    p_teacher_id,
    least(greatest(coalesce(p_limit, 10), 1), 20)
  );
end;
$$;

revoke all on function public.match_tuitions_for_teacher_rpc(uuid, int) from public, anon;
grant execute on function public.match_tuitions_for_teacher_rpc(uuid, int) to authenticated;
