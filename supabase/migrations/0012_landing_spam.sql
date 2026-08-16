-- ============================================================================
-- PoraSathi (পড়াসাথী) — 0012: Landing stats + spam protection helpers
-- ----------------------------------------------------------------------------
-- 1. site_stats() — ল্যান্ডিং পেজের জন্য count (head:true, কোনো write নেই)
-- 2. pending_request_count() — স্প্যাম protection: একজন student কতগুলো pending
--    request রেখেছে (app layer-এ limit বসাবে)
-- Idempotent — safe to re-run.
-- ============================================================================

-- 1. Landing stats ------------------------------------------------------------
create or replace function public.site_stats()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_teachers bigint; v_students bigint; v_open_tuitions bigint; v_reviews bigint; v_districts bigint;
begin
  select count(*) into v_teachers from public.profiles where role='teacher' and account_status='active';
  select count(*) into v_students from public.profiles where role='student' and account_status='active';
  select count(*) into v_open_tuitions from public.tuitions where status='open';
  select count(*) into v_reviews from public.reviews where status='published';
  select count(distinct district) into v_districts from public.profiles where district is not null;

  return json_build_object(
    'teachers', v_teachers,
    'students', v_students,
    'open_tuitions', v_open_tuitions,
    'reviews', v_reviews,
    'districts', v_districts
  );
end;
$$;

revoke all on function public.site_stats() from public;
grant execute on function public.site_stats() to anon, authenticated;

-- 2. Pending request count (spam protection) ---------------------------------
create or replace function public.pending_request_count(p_user_id uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int from public.tuition_requests
  where sender_id = p_user_id and status = 'pending';
$$;

revoke all on function public.pending_request_count(uuid) from public;
grant execute on function public.pending_request_count(uuid) to authenticated;
