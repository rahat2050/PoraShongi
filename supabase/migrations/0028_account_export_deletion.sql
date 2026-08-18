-- Self-service permanent deletion with a minimal anonymized profile shell.
create or replace function public.permanently_delete_own_account(p_confirmation text)
returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.profiles%rowtype;
begin
  if v_user_id is null then raise exception 'Authentication required.' using errcode = '42501'; end if;
  if p_confirmation <> 'DELETE MY ACCOUNT' then raise exception 'Invalid deletion confirmation.'; end if;
  select * into v_profile from public.profiles where id = v_user_id for update;
  if v_profile.id is null then raise exception 'Profile not found.'; end if;
  if v_profile.role = 'admin' or v_profile.is_super_admin then
    raise exception 'Admin accounts require an ownership transfer before deletion.';
  end if;

  delete from public.messages where sender_id = v_user_id;
  delete from public.conversations where participant_a = v_user_id or participant_b = v_user_id;
  delete from public.notifications where user_id = v_user_id;
  delete from public.notification_preferences where user_id = v_user_id;
  delete from public.favorites where user_id = v_user_id or teacher_id = v_user_id;
  delete from public.blocks where blocker_id = v_user_id or blocked_id = v_user_id;
  delete from public.contact_requests where sender_id = v_user_id or teacher_id = v_user_id;
  delete from public.batch_members where student_id = v_user_id;
  delete from public.trial_requests where sender_id = v_user_id or teacher_id = v_user_id;
  delete from public.referrals where referrer_id = v_user_id or referred_id = v_user_id;
  delete from public.subscriptions where profile_id = v_user_id;
  delete from public.education_resources where uploader_id = v_user_id;
  delete from public.coaching_centers where owner_id = v_user_id;
  delete from public.blog_posts where author_id = v_user_id;
  delete from public.student_profiles where id = v_user_id;
  delete from public.teacher_profiles where id = v_user_id;
  delete from public.guardian_profiles where id = v_user_id;

  update public.profiles set
    full_name = 'Deleted User', display_name = 'Deleted User', avatar_url = null,
    district = null, area = null, latitude = null, longitude = null, gender = null,
    is_minor = false, guardian_consent = false, phone = null, phone_verified = false,
    education_verified = false, identity_verified = false, trusted_tutor = false,
    referral_code = null, is_premium = false, premium_until = null,
    account_status = 'deleted', verification_status = 'unverified', updated_at = now()
  where id = v_user_id;

  delete from auth.identities where user_id = v_user_id;
  update auth.users set
    email = 'deleted+' || v_user_id::text || '@deleted.invalid',
    phone = null, encrypted_password = '', raw_user_meta_data = '{}'::jsonb,
    banned_until = 'infinity'::timestamptz, updated_at = now()
  where id = v_user_id;
end;
$$;
revoke all on function public.permanently_delete_own_account(text) from public, anon;
grant execute on function public.permanently_delete_own_account(text) to authenticated;
comment on function public.permanently_delete_own_account(text) is 'Deletes private/ephemeral account data, disables auth, and preserves only an anonymized shared-history profile shell.';
