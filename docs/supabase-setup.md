# Supabase Setup

## 1. Create a project

1. Go to [database.new](https://database.new) and sign in.
2. Click **New project**, pick a region close to Bangladesh (e.g.
   `ap-southeast-1` Singapore) and a strong database password.
3. Wait for the project to provision.

The **Free Tier** is sufficient for Phase 1.

## 2. Apply the schema

Open **SQL Editor → New query**, paste the contents of
`supabase/migrations/20260813000001_init.sql`, and **Run**.

Alternatively use the CLI:

```bash
supabase login
supabase link --project-ref YOUR-PROJECT-REF
supabase db push
```

The migration is idempotent and creates:

- Enums: `user_role`, `account_status`, `verification_status`
- Tables: `profiles`, `student_profiles`, `teacher_profiles`, `guardian_profiles`
- Triggers: auto-create profiles on signup, sync role-specific profiles,
  `updated_at`, role-change protection
- RLS policies: own-data-only + admin access

## 3. Configure environment variables

Copy your keys into `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi…        # the "anon" key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi…            # the "service_role" key (server only)
```

## 4. Configure Auth

Authentication → Providers:

- **Email** — enabled by default.
  - *Confirm email*: recommended ON (registration then requires a verified
    email before login).
  - If you want to test quickly, you can turn it OFF (sessions are returned
    immediately).

Authentication → URL Configuration:

- **Site URL**: `http://localhost:3000` (dev) or your Vercel domain.
- **Redirect URLs** — add `http://localhost:3000/auth/callback` (dev) and
  `https://your-domain.vercel.app/auth/callback`.

## 5. Create an admin (optional)

After registering normally, promote a user to admin in the SQL editor:

```sql
update public.profiles set role = 'admin' where id = 'USER-UUID';
```

The `/admin` page is then available to that account. (Phase 1 keeps admin
read-only.)

## 6. Verify RLS

- Two users can only read/update their own profile rows.
- A non-admin hitting `/admin` is denied.
- A user cannot change their own `role` column.

## Troubleshooting

- **"Supabase is not configured"** — env vars missing; check `.env.local`.
- **Auth links 404** — make sure the Redirect URL includes `/auth/callback`.
- **Signup doesn't create a profile** — re-run the migration; the
  `on_auth_user_created` trigger creates it.
