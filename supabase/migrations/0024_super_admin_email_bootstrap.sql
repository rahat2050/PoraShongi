-- Secure, reusable super-admin bootstrap by Auth email.
-- The email is supplied only in the Supabase SQL Editor and is not committed
-- to the public repository.

alter table public.profiles
  add column if not exists is_super_admin boolean not null default false;

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
     and coalesce(current_setting('app.super_admin_bootstrap', true), '') <> 'on'
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Super-admin status can only be changed from a trusted bootstrap session.' using errcode = '42501';
  end if;

  if (old.role = 'admin' or old.is_super_admin = true)
     and coalesce(auth.role(), '') <> 'service_role'
     and coalesce(current_setting('app.super_admin_bootstrap', true), '') <> 'on'
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
     and coalesce(current_setting('app.super_admin_bootstrap', true), '') <> 'on'
     and not public.is_admin() then
    raise exception 'Only an admin can reactivate a suspended or pending account.' using errcode = '42501';
  end if;

  return new;
end;
$$;

create or replace function public.bootstrap_super_admin_by_email(p_email text)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_email text := lower(trim(coalesce(p_email, '')));
begin
  if v_email = '' or position('@' in v_email) <= 1 then
    raise exception 'A valid account email is required.';
  end if;

  select u.id into v_user_id
  from auth.users u
  where lower(u.email) = v_email
  limit 1;

  if v_user_id is null then
    raise exception 'No Supabase Auth user was found for this email.';
  end if;

  if not exists (select 1 from public.profiles p where p.id = v_user_id) then
    raise exception 'The Auth user exists but its public profile is missing.';
  end if;

  perform set_config('app.super_admin_bootstrap', 'on', true);

  -- Keep a single project-owner super admin. This also corrects an earlier
  -- ID-based bootstrap if the owner's actual Auth email belongs to another profile.
  update public.profiles
  set is_super_admin = false
  where is_super_admin = true and id <> v_user_id;

  update public.profiles
  set is_super_admin = true,
      account_status = 'active'
  where id = v_user_id;

  return v_user_id;
end;
$$;

revoke all on function public.bootstrap_super_admin_by_email(text) from public, anon, authenticated;
grant execute on function public.bootstrap_super_admin_by_email(text) to service_role;

comment on function public.bootstrap_super_admin_by_email(text) is
  'Run only from a trusted Supabase SQL Editor/service-role session to promote an existing Auth email.';
