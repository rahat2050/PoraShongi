# AGENTS.md

Guidance for coding agents working on the PoraShongi repository.

## Project

PoraShongi (পড়াসঙ্গী) — "পড়াশোনার সঠিক সঙ্গী" (The Right Companion for Your
Studies). A Bangladesh-focused teacher–student tuition marketplace.

Stack: Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Supabase
(PostgreSQL + Auth + RLS) · Cloudinary · Vercel · GitHub.

## Non-negotiables

1. **Phase-based development** — implement only the current phase. Never skip
   or combine phases. Refer to the phase prompt for scope.
2. **Branch naming is fixed** — e.g. `PHASE-1-FOUNDATION-ARCHITECTURE`. Never
   work on `main`, never invent branch names.
3. **Never commit secrets** — only `.env.example` is tracked.
4. **Never merge PRs** — open the PR against `main` and stop.
5. **Quality gates must pass** before completing a phase:
   `npm run lint`, `npm run build`, `npm run typecheck`.
6. **Service-role key stays server-side** — it is read only inside
   `src/lib/supabase/admin.ts` (guarded by `server-only`).
7. **Auth is layered** — proxy (`src/proxy.ts`) + server-side guards
   (`src/lib/auth/server-auth.ts`) + database RLS.

## Conventions

- Routes live under `src/app/`. Protected pages belong to the `(protected)`
  route group.
- Reusable UI primitives → `src/components/ui/`.
- Domain logic + screens → `src/features/<module>/`.
- Validation → `src/validation/` (Zod).
- Types → `src/types/` (`database.ts` mirrors the Supabase schema — keep it in
  sync with new migrations).
- Database changes → new file in `supabase/migrations/` with a timestamped
  name.

## Next.js 16 specifics

- Use `proxy.ts` (not `middleware.ts`).
- `cookies()`, `headers()`, `params`, `searchParams` are async — await them.
- `next lint` is removed — lint via `eslint` (see `package.json`).
- Turbopack is the default bundler.

## Before touching code

Inspect for broken/duplicate/dead code and dependency conflicts; fix safely
without regressions.
