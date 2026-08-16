-- ============================================================================
-- PoraSathi (পড়াসাথী) — 0008: Fast response + account lifecycle polish
-- ----------------------------------------------------------------------------
-- 1. get_teacher_reputation-এ avg_response_hours যোগ (কোনো নতুন write নয় —
--    existing request data থেকে হিসাব)।
-- 2. Account soft-delete policy note: user নিজে account নিষ্ক্রিয়/চালু করে।
-- Idempotent — safe to re-run.
-- ============================================================================

-- 1. Reputation + fast response indicator ------------------------------------
create or replace function public.get_teacher_reputation(p_teacher_id uuid)
returns json language sql stable security definer set search_path = public as $$
  select coalesce(row_to_json(x)::json, 'null'::json) from (
    select p.verification_status, p.phone_verified, p.education_verified,
      p.identity_verified, p.trusted_tutor, public.verification_tier(p.id) as tier,
      coalesce(tp.rating_avg,0) as rating_avg, coalesce(tp.review_count,0) as review_count,
      (select count(*) from public.tuitions t
        join public.tuition_requests r on r.tuition_id = t.id
        where r.teacher_id = p.id and r.status = 'accepted' and t.status = 'completed') as completed_tuitions,
      coalesce((select round(100.0 * count(*) filter (where r.status='accepted')
        / nullif(count(*) filter (where r.status in ('accepted','rejected')),0),0)
        from public.tuition_requests r where r.teacher_id = p.id), 0) as response_rate,
      coalesce((select round(100.0 * count(*) filter (where s.status='cancelled')
        / nullif(count(*),0),0) from public.sessions s where s.teacher_id = p.id), 0) as cancellation_rate,
      -- Fast response: গড় কত ঘণ্টায় respond করে (responded - created)
      (select round(avg(extract(epoch from (r.responded_at - r.created_at))/3600)::numeric, 1)
        from public.tuition_requests r
        where r.teacher_id = p.id and r.status in ('accepted','rejected') and r.responded_at is not null) as avg_response_hours
    from public.profiles p
    join public.teacher_profiles tp on tp.id = p.id
    where p.id = p_teacher_id and p.role = 'teacher'
  ) x;
$$;

-- 2. Account নিজে নিষ্ক্রিয়/চালু (soft — data হারায় না, admin restore করতে পারে) --
create or replace function public.toggle_own_account(p_active boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
     set account_status = (case when p_active then 'active' else 'deleted' end)::public.account_status
   where id = auth.uid();
end;
$$;

grant execute on function public.toggle_own_account(boolean) to authenticated;
