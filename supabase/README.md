# Supabase — migrations & database

This folder contains the database schema for PoraShongi.

## Files

- `migrations/20260813000001_init.sql` — Phase 1 schema (profiles,
  role-specific profiles, enums, triggers, helpers, Row Level Security).

## How to apply

### Option A — Supabase SQL editor (quickest)

1. Open your project at [database.new](https://database.new) → **SQL Editor**.
2. Paste the contents of the migration file.
3. Click **Run**.

The script is idempotent, so re-running it is safe.

### Option B — Supabase CLI (recommended for a team)

```bash
# 1. Install the CLI and link your project
npm install -g supabase
supabase login
supabase link --project-ref YOUR-PROJECT-REF

# 2. Push migrations
supabase db push
```

## Schema overview

| Table              | Purpose                                              |
| ------------------ | ---------------------------------------------------- |
| `profiles`         | Base profile — one row per auth user                 |
| `student_profiles` | Student-specific fields (grade, institution, …)      |
| `teacher_profiles` | Teacher-specific fields (subjects, experience, …)    |
| `guardian_profiles`| Guardian-specific fields (relationship, …)           |

Each authenticated user is automatically given a `profiles` row (via the
`handle_new_user` trigger) and a matching role-specific row (via
`handle_profile_role`).

## Security

- Row Level Security is enabled on every table.
- Users can only read/update **their own** rows.
- Only admins (role `admin`, active account) can read all rows or delete rows.
- Users cannot change their own role (`prevent_role_change` trigger).
- The `anon` role has no access to any table.
