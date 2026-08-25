-- ============================================================================
-- PoraSathi (পড়াসাথী) — 0034: Public (anonymous) tuition job listing
-- ----------------------------------------------------------------------------
-- সমস্যা: /tuitions সম্পূর্ণ login-gated + noindex ছিল। ফলে —
--   * Google-এ আমাদের একটাও টিউশন জব ইনডেক্স হয় না;
--   * নতুন শিক্ষক দেখতেই পারেন না প্ল্যাটফর্মে কাজ আছে কিনা → রেজিস্টার করেন না।
-- প্রতিযোগীরা (Tuition Media, Tuition Terminal) জব পাবলিক দেখায়।
--
-- সমাধান: একটি **আলাদা** anon-callable RPC যা কঠোরভাবে নিরাপদ কলাম-সাবসেট দেয়।
-- বিদ্যমান search_tuitions() (authenticated-only) অপরিবর্তিত থাকে।
--
-- পাবলিক ভিউতে যা থাকে: ক্লাস, বিষয়, জেলা, এলাকা, বাজেট, মোড, দিন/সময়, তারিখ।
-- পাবলিক ভিউতে যা **কখনো** থাকে না:
--   * poster_id / poster_name / poster_avatar (পোস্টদাতার পরিচয়)
--   * student_id, requirements (মুক্ত টেক্সটে ফোন/ঠিকানা থাকতে পারে)
--   * meeting_link
--   * minor-এর ক্ষেত্রে area পর্যন্ত মাস্ক করা হয়
-- শুধু status='open' টিউশন প্রকাশ পায়।
--
-- Idempotent — safe to re-run.
-- Apply with: supabase db push
-- ============================================================================

create or replace function public.public_tuitions_search(
  p_class text default null,
  p_subject text default null,
  p_district text default null,
  p_area text default null,
  p_min_budget numeric default null,
  p_max_budget numeric default null,
  p_mode text default null,
  p_day text default null,
  p_time text default null,
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
begin
  select count(*) into v_total
  from public.tuitions t
  join public.profiles po on po.id = t.poster_id
  where t.status = 'open'
    and po.account_status = 'active'
    and (p_class is null or t.class_level = p_class)
    and (p_subject is null or t.subject = p_subject)
    and (p_district is null or lower(coalesce(t.district, '')) = lower(p_district))
    and (p_area is null or lower(coalesce(t.area, '')) = lower(p_area))
    and (p_min_budget is null or coalesce(t.budget, 0) >= p_min_budget)
    and (p_max_budget is null or coalesce(t.budget, 0) <= p_max_budget)
    and (p_mode is null or t.teaching_mode = p_mode or t.teaching_mode = 'both')
    and (p_day is null or t.preferred_days @> array[p_day])
    and (p_time is null or coalesce(t.preferred_time, '') ilike '%' || p_time || '%');

  select coalesce(json_agg(x), '[]'::json) into v_results
  from (
    select
      t.id,
      t.title,
      t.class_level,
      t.subject,
      t.district,
      -- অপ্রাপ্তবয়স্ক পোস্টদাতার এলাকা পর্যন্ত প্রকাশ করা হয় না
      case when po.is_minor then null else t.area end as area,
      t.budget,
      t.budget_negotiable,
      t.teaching_mode,
      t.preferred_days,
      t.preferred_time,
      t.is_featured,
      t.featured_until,
      t.is_batch,
      t.batch_size,
      t.seats_filled,
      t.status,
      t.created_at
      -- ইচ্ছাকৃতভাবে বাদ: poster_id, poster_name, poster_avatar, poster_role,
      -- student_id, requirements, meeting_link
    from public.tuitions t
    join public.profiles po on po.id = t.poster_id
    where t.status = 'open'
      and po.account_status = 'active'
      and (p_class is null or t.class_level = p_class)
      and (p_subject is null or t.subject = p_subject)
      and (p_district is null or lower(coalesce(t.district, '')) = lower(p_district))
      and (p_area is null or lower(coalesce(t.area, '')) = lower(p_area))
      and (p_min_budget is null or coalesce(t.budget, 0) >= p_min_budget)
      and (p_max_budget is null or coalesce(t.budget, 0) <= p_max_budget)
      and (p_mode is null or t.teaching_mode = p_mode or t.teaching_mode = 'both')
      and (p_day is null or t.preferred_days @> array[p_day])
      and (p_time is null or coalesce(t.preferred_time, '') ilike '%' || p_time || '%')
    order by
      (t.is_featured and (t.featured_until is null or t.featured_until > now())) desc,
      t.created_at desc
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

revoke all on function public.public_tuitions_search(
  text, text, text, text, numeric, numeric, text, text, text, int, int
) from public;

grant execute on function public.public_tuitions_search(
  text, text, text, text, numeric, numeric, text, text, text, int, int
) to anon, authenticated;

comment on function public.public_tuitions_search(
  text, text, text, text, numeric, numeric, text, text, text, int, int
) is
  'Anonymous-safe open tuition listing. Never returns poster identity, student_id, requirements or meeting links.';

-- ============================================================================
-- get_public_tuition_teaser — একক টিউশনের পাবলিক (anon) সংস্করণ
-- ----------------------------------------------------------------------------
-- বিদ্যমান get_public_tuition() authenticated ও relationship-aware থাকে।
-- এটি শুধু সেই নিরাপদ কলামগুলো দেয় যা তালিকাতেও দেখানো হয়, যাতে
-- /tuitions/[id] পাতা লগইন ছাড়াই index করা যায়।
-- ============================================================================
create or replace function public.get_public_tuition_teaser(p_tuition_id uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(row_to_json(x)::json, 'null'::json)
  from (
    select
      t.id,
      t.title,
      t.class_level,
      t.subject,
      t.district,
      case when po.is_minor then null else t.area end as area,
      t.budget,
      t.budget_negotiable,
      t.teaching_mode,
      t.preferred_days,
      t.preferred_time,
      t.is_featured,
      t.featured_until,
      t.is_batch,
      t.batch_size,
      t.seats_filled,
      t.status,
      t.created_at
    from public.tuitions t
    join public.profiles po on po.id = t.poster_id
    where t.id = p_tuition_id
      and t.status = 'open'
      and po.account_status = 'active'
  ) x;
$$;

revoke all on function public.get_public_tuition_teaser(uuid) from public;
grant execute on function public.get_public_tuition_teaser(uuid) to anon, authenticated;

-- ============================================================================
-- public_tuition_stats — হোমপেজের "গত ২৪ ঘণ্টায় X নতুন টিউশন"
-- ============================================================================
create or replace function public.public_tuition_stats()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'open_total', (
      select count(*) from public.tuitions t
      join public.profiles po on po.id = t.poster_id
      where t.status = 'open' and po.account_status = 'active'
    ),
    'new_24h', (
      select count(*) from public.tuitions t
      join public.profiles po on po.id = t.poster_id
      where t.status = 'open' and po.account_status = 'active'
        and t.created_at > now() - interval '24 hours'
    ),
    'new_7d', (
      select count(*) from public.tuitions t
      join public.profiles po on po.id = t.poster_id
      where t.status = 'open' and po.account_status = 'active'
        and t.created_at > now() - interval '7 days'
    )
  );
$$;

revoke all on function public.public_tuition_stats() from public;
grant execute on function public.public_tuition_stats() to anon, authenticated;
