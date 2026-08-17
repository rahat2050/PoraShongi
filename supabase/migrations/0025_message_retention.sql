-- Ephemeral chat retention: messages are automatically deleted after 48 hours.
-- Conversations remain so the same two users can safely resume a future chat.

create index if not exists messages_created_at_idx
  on public.messages (created_at);

create or replace function public.cleanup_expired_messages()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_deleted integer := 0;
  v_conversation_ids uuid[] := array[]::uuid[];
begin
  with deleted as (
    delete from public.messages
    where created_at < now() - interval '48 hours'
    returning conversation_id
  )
  select
    coalesce(array_agg(distinct conversation_id), array[]::uuid[]),
    count(*)::integer
  into v_conversation_ids, v_deleted
  from deleted;

  if v_deleted > 0 then
    update public.conversations c
    set last_message_at = (
      select max(m.created_at)
      from public.messages m
      where m.conversation_id = c.id
    )
    where c.id = any(v_conversation_ids);
  end if;

  return v_deleted;
end;
$$;

revoke all on function public.cleanup_expired_messages() from public, anon, authenticated;
grant execute on function public.cleanup_expired_messages() to service_role;

comment on function public.cleanup_expired_messages() is
  'Deletes chat messages older than 48 hours and refreshes affected conversation timestamps.';

-- Activity-driven fallback: even if pg_cron is unavailable, every message
-- insert performs one indexed retention cleanup for the whole table.
create or replace function public.prune_expired_messages_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.cleanup_expired_messages();
  return null;
end;
$$;

revoke all on function public.prune_expired_messages_after_insert() from public, anon, authenticated;

drop trigger if exists messages_retention_prune on public.messages;
create trigger messages_retention_prune
  after insert on public.messages
  for each statement execute function public.prune_expired_messages_after_insert();

-- Run the first cleanup immediately when this migration is applied.
select public.cleanup_expired_messages();

-- Supabase supports pg_cron on hosted projects. Schedule hourly cleanup when
-- available; the protected insert trigger above remains the fallback.
do $message_retention$
declare
  v_job_id bigint;
begin
  begin
    execute 'create extension if not exists pg_cron';

    for v_job_id in
      select jobid from cron.job where jobname = 'porasathi-message-retention-48h'
    loop
      perform cron.unschedule(v_job_id);
    end loop;

    perform cron.schedule(
      'porasathi-message-retention-48h',
      '17 * * * *',
      'select public.cleanup_expired_messages();'
    );
  exception when others then
    raise notice 'pg_cron schedule was not installed; insert-trigger cleanup remains active: %', sqlerrm;
  end;
end;
$message_retention$;
