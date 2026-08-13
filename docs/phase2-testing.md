# Phase 2 — Testing

Phase 2 was tested at the database level against a real PostgreSQL 17 instance
with a Supabase-compatible harness (roles `anon`/`authenticated`/`service_role`,
`auth.users`, `auth.uid()`, `supabase_realtime` publication), by running the
migrations in order and then exercising the core flows.

## How to run

```bash
# 1. Start PostgreSQL and create the harness (see below), then:
psql -d postgres -v ON_ERROR_STOP=1 -f supabase/migrations/20260813000001_init.sql
psql -d postgres -v ON_ERROR_STOP=1 -f supabase/migrations/20260813000002_mvp.sql
# 2. Run the integration checks below.
```

## Results (all pass ✅)

| # | Test | Result |
| - | ---- | ------ |
| 1 | Migrations run without SQL errors | ✅ |
| 2 | Signup trigger creates `profiles` + role-specific row | ✅ |
| 3 | RLS: a teacher sees only their own profile | ✅ |
| 4 | RLS: a teacher **cannot** update another user's profile | ✅ |
| 5 | Tuition creation (student) | ✅ |
| 6 | Tuition request creation (student → teacher) | ✅ |
| 7 | Duplicate active request blocked (partial unique index) | ✅ |
| 8 | `new_request` notification created for the teacher | ✅ |
| 9 | Accepting a request auto-sets tuition → `assigned` | ✅ |
| 10 | `request_accepted` notification created for the sender | ✅ |
| 11 | Notifications are RLS-scoped (each user sees only their own) | ✅ |
| 12 | `search_teachers` works (subject & class filters) | ✅ |
| 13 | `search_tuitions` works | ✅ |
| 14 | `get_public_teacher` works | ✅ |
| 15 | Public teacher payload does **not** expose `phone`/`email` | ✅ |
| 16 | Favorites: save works; RLS hides them from other users | ✅ |

## Key findings

- The Phase 2 migrations and backend logic are **correct**.
- RLS behaves exactly as designed (own-data-only, no cross-user writes).
- Notifications fire correctly; they only *looked* missing when queried as the
  wrong user (which is RLS working as intended).
- No sensitive contact data leaks through the public teacher RPC.

## What the database test cannot cover

- Browser-level auth (Supabase Auth) and the full Next.js UI flow — this needs
  a live Supabase project. Steps:
  1. Create a project at https://database.new
  2. Run `supabase/migrations/*.sql` in the SQL editor (in order)
  3. `cp .env.example .env.local` and fill in the Supabase URL + anon key
  4. `npm install && npm run dev`, then open `/api/health` — it should show
     `database.migrationsApplied: true`.
