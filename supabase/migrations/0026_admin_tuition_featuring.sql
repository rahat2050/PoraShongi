-- Admin-only tuition featuring and automatic cleanup on status changes.
update public.tuitions set is_featured = false, featured_until = null
where status <> 'open' and is_featured = true;

create or replace function public.enforce_admin_tuition_featuring()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.is_featured is distinct from new.is_featured
     and coalesce(auth.role(), '') <> 'service_role'
     and not public.is_admin() then
    raise exception 'Only an admin can change tuition featuring.' using errcode = '42501';
  end if;

  if new.status <> 'open' then
    new.is_featured := false;
    new.featured_until := null;
  elsif new.is_featured = false then
    new.featured_until := null;
  end if;

  return new;
end;
$$;

drop trigger if exists tuitions_admin_featuring on public.tuitions;
create trigger tuitions_admin_featuring
  before update on public.tuitions
  for each row execute function public.enforce_admin_tuition_featuring();
