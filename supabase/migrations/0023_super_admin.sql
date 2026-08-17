-- Super-admin capability without changing the owner's teacher role.
-- The selected profile keeps its teacher dashboard while gaining full admin
-- access. The flag cannot be changed from a normal user session.

alter table public.profiles
  add column if not exists is_super_admin boolean not null default false;

-- Project owner / primary Rahat Ahmed teacher profile.
update public.profiles
set is_super_admin = true,
    account_status = 'active'
where id = '98de7fb7-17a5-4f79-a36b-c0814f406e90'::uuid;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.account_status = 'active'
      and (p.role = 'admin' or p.is_super_admin = true)
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'User roles can only be changed by the service role.' using errcode = '42501';
  end if;

  if old.is_super_admin is distinct from new.is_super_admin
     and session_user <> 'postgres'
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Super-admin status can only be changed from a trusted database session.' using errcode = '42501';
  end if;

  if (old.role = 'admin' or old.is_super_admin = true)
     and coalesce(auth.role(), '') <> 'service_role'
     and (
       old.account_status is distinct from new.account_status
       or old.verification_status is distinct from new.verification_status
       or old.is_premium is distinct from new.is_premium
     ) then
    raise exception 'Admin accounts cannot be moderated from a user session.' using errcode = '42501';
  end if;

  if old.account_status in ('suspended', 'pending')
     and old.account_status is distinct from new.account_status
     and coalesce(auth.role(), '') <> 'service_role'
     and not public.is_admin() then
    raise exception 'Only an admin can reactivate a suspended or pending account.' using errcode = '42501';
  end if;

  return new;
end;
$$;
