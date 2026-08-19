-- Privacy-safe first-party visitor analytics for the project owner.
-- Storage is deliberately bounded to one aggregate row per calendar day.
-- No IP address, user agent, route, location, account ID, or fingerprint is stored.

create table if not exists public.visitor_daily_stats (
  visit_date date primary key,
  visitors bigint not null default 0 check (visitors >= 0),
  page_views bigint not null default 0 check (page_views >= 0),
  updated_at timestamptz not null default now()
);

alter table public.visitor_daily_stats enable row level security;
revoke all on table public.visitor_daily_stats from public, anon, authenticated;

comment on table public.visitor_daily_stats is
  'Daily aggregate visitor and page-view counts only; contains no visitor identity or browsing details.';
comment on column public.visitor_daily_stats.visitors is
  'Estimated unique browsers for the Dhaka calendar day, deduplicated by a first-party daily cookie.';

-- Anonymous callers can increment aggregates but can never read the table.
create or replace function public.record_site_visit(p_is_unique boolean default false)
returns void
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_today date := timezone('Asia/Dhaka', clock_timestamp())::date;
begin
  insert into public.visitor_daily_stats (visit_date, visitors, page_views, updated_at)
  values (v_today, case when coalesce(p_is_unique, false) then 1 else 0 end, 1, now())
  on conflict (visit_date) do update
  set visitors = public.visitor_daily_stats.visitors
      + case when coalesce(p_is_unique, false) then 1 else 0 end,
      page_views = public.visitor_daily_stats.page_views + 1,
      updated_at = now();
end;
$$;

revoke all on function public.record_site_visit(boolean) from public;
grant execute on function public.record_site_visit(boolean) to anon, authenticated;

comment on function public.record_site_visit(boolean) is
  'Increments privacy-safe daily aggregates. The caller receives no analytics data.';

-- Only an active super admin can read visitor analytics. Normal admins remain
-- able to use the existing marketplace analytics but cannot access this data.
create or replace function public.super_admin_visitor_analytics(p_days integer default 14)
returns json
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_today date := timezone('Asia/Dhaka', current_timestamp)::date;
  v_days integer := least(greatest(coalesce(p_days, 14), 7), 31);
begin
  if auth.uid() is null or not exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.account_status = 'active'
      and p.is_super_admin = true
  ) then
    raise exception 'Super admin access required.' using errcode = '42501';
  end if;

  return (
    select json_build_object(
      'today', json_build_object(
        'visitors', coalesce((select s.visitors from public.visitor_daily_stats s where s.visit_date = v_today), 0),
        'page_views', coalesce((select s.page_views from public.visitor_daily_stats s where s.visit_date = v_today), 0)
      ),
      'last_7_days', json_build_object(
        'visitors', coalesce((select sum(s.visitors) from public.visitor_daily_stats s where s.visit_date between v_today - 6 and v_today), 0),
        'page_views', coalesce((select sum(s.page_views) from public.visitor_daily_stats s where s.visit_date between v_today - 6 and v_today), 0)
      ),
      'last_30_days', json_build_object(
        'visitors', coalesce((select sum(s.visitors) from public.visitor_daily_stats s where s.visit_date between v_today - 29 and v_today), 0),
        'page_views', coalesce((select sum(s.page_views) from public.visitor_daily_stats s where s.visit_date between v_today - 29 and v_today), 0)
      ),
      'all_time', json_build_object(
        'visitors', coalesce((select sum(s.visitors) from public.visitor_daily_stats s), 0),
        'page_views', coalesce((select sum(s.page_views) from public.visitor_daily_stats s), 0)
      ),
      'daily', (
        select coalesce(
          json_agg(
            json_build_object(
              'date', d.day::date::text,
              'visitors', coalesce(s.visitors, 0),
              'page_views', coalesce(s.page_views, 0)
            ) order by d.day
          ),
          '[]'::json
        )
        from generate_series(
          v_today - (v_days - 1),
          v_today,
          interval '1 day'
        ) as d(day)
        left join public.visitor_daily_stats s on s.visit_date = d.day::date
      )
    )
  );
end;
$$;

revoke all on function public.super_admin_visitor_analytics(integer) from public, anon;
grant execute on function public.super_admin_visitor_analytics(integer) to authenticated;

comment on function public.super_admin_visitor_analytics(integer) is
  'Returns aggregate visitor trends only to an active super admin.';
