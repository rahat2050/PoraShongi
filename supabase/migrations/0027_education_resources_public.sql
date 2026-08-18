-- Minimal, link-only Education Resources marketplace.
alter table public.education_resources enable row level security;

create unique index if not exists education_resources_uploader_url_unique
  on public.education_resources (uploader_id, lower(resource_url));
create index if not exists education_resources_created_idx
  on public.education_resources (created_at desc);

create or replace function public.validate_education_resource()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = new.uploader_id
      and p.account_status = 'active'
      and (p.role in ('teacher', 'admin') or p.is_super_admin = true)
  ) then
    raise exception 'Only active teachers or admins can add resources.';
  end if;
  if new.resource_url !~* '^https://' or char_length(new.resource_url) > 1000 then
    raise exception 'A public HTTPS resource URL is required.';
  end if;
  if (select count(*) from public.education_resources r where r.uploader_id = new.uploader_id) >= 50 then
    raise exception 'Resource limit reached.';
  end if;
  return new;
end;
$$;

drop trigger if exists education_resources_validate on public.education_resources;
create trigger education_resources_validate
  before insert on public.education_resources
  for each row execute function public.validate_education_resource();

drop policy if exists "education_resources_select_all" on public.education_resources;
create policy "education_resources_select_all" on public.education_resources
  for select to anon, authenticated using (true);

drop policy if exists "education_resources_insert_own" on public.education_resources;
create policy "education_resources_insert_own" on public.education_resources
  for insert to authenticated
  with check (
    auth.uid() = uploader_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.account_status = 'active'
        and (p.role in ('teacher', 'admin') or p.is_super_admin = true)
    )
  );

drop policy if exists "education_resources_delete_own" on public.education_resources;
create policy "education_resources_delete_own" on public.education_resources
  for delete to authenticated using (auth.uid() = uploader_id or public.is_admin());

grant select on public.education_resources to anon, authenticated;
grant insert, delete on public.education_resources to authenticated;
