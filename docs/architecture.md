# Architecture

## Overview

PoraShongi is a Next.js 16 (App Router) application with a Supabase backend.
This document describes the Phase 1 folder structure and the decisions behind
it.

## Folder structure

```
src/
├── app/                          # App Router routes (file-based)
│   ├── layout.tsx                # Root layout (fonts, header, footer)
│   ├── page.tsx                  # Public landing page
│   ├── globals.css               # Tailwind v4 tokens & base styles
│   ├── icon.svg                  # Favicon / app icon
│   ├── not-found.tsx             # 404
│   ├── error.tsx                 # Global error boundary
│   ├── (auth)/                   # Auth pages (centered layout)
│   │   ├── login/ register/ forgot-password/ reset-password/
│   ├── (protected)/              # Route group guarded server-side
│   │   ├── dashboard/            # Role-aware dashboards (+redirect)
│   │   │   ├── student/ teacher/ guardian/
│   │   │   ├── tuitions/ (list, new, [id])   # own tuition management
│   │   │   ├── requests/ favorites/ notifications/
│   │   ├── profile/              # Role-aware profile editor
│   │   └── admin/                # Admin panel (users, teachers, …)
│   ├── teachers/                 # PUBLIC teacher search + profile
│   │   ├── page.tsx, [id]/page.tsx
│   ├── tuitions/                 # PUBLIC tuition search + detail
│   │   ├── page.tsx, [id]/page.tsx
│   ├── auth/callback/route.ts    # Auth code exchange (email links)
│   └── api/health/route.ts       # Health/diagnostics endpoint
│
├── components/
│   ├── ui/                       # Design-system primitives
│   ├── layout/                   # Header, footer, logo, auth area
│   └── shared/                   # Cards, filters, badges, request UI
│
├── features/                     # Feature modules (domain logic + UI)
│   ├── auth/                     # Sign-in/up, password reset forms
│   ├── profile/                  # Base + role profile forms & actions
│   ├── tuitions/                 # Tuition form, manage actions
│   ├── requests/                 # Request actions (accept/reject/withdraw)
│   ├── favorites/ notifications/ admin/   # Actions + UI
│   └── types.ts                  # Shared ActionResult type
│
├── lib/
│   ├── supabase/                 # Supabase clients (browser/server/admin/proxy)
│   ├── auth/                     # Server-side auth & roles
│   ├── data/                     # Server-only data access layer (queries)
│   ├── cloudinary.ts             # Image upload & optimization
│   ├── env.ts                    # Client-safe env access
│   └── utils.ts                  # cn(), formatters, query-string, redirect sanitizer
│
├── types/                        # Domain types + Database type
├── config/                       # Brand/site config + option lists
├── validation/                   # Zod schemas
└── proxy.ts                      # Next.js 16 proxy (was "middleware")
```

## Key decisions

### 1. Route protection is layered (defense in depth)

1. **`src/proxy.ts`** — refreshes the Supabase session and redirects
   unauthenticated users away from `/dashboard`, `/profile`, `/admin`
   (coarse UX-level protection).
2. **`(protected)/layout.tsx`** — re-checks the session server-side via
   `getCurrentProfile()` and redirects to `/login` if absent (authoritative).
3. **Database RLS** — the final authority: users can only ever read/update
   their own rows.

### 2. Supabase SSR pattern

`@supabase/ssr` is used with cookie-based sessions:

- `lib/supabase/client.ts` → `createBrowserClient` (Client Components)
- `lib/supabase/server.ts` → `createServerClient` + `next/headers` cookies
- `lib/supabase/proxy.ts` → `updateSession()` used by `src/proxy.ts`
- `lib/supabase/admin.ts` → service-role client, guarded by `server-only`

### 3. Server-only secrets

`src/lib/supabase/admin.ts` imports the `server-only` package. Any accidental
import into a Client Component fails the build, guaranteeing the service-role
key never ships to the browser.

### 4. Types & validation

- `src/types/database.ts` mirrors the Supabase schema for a fully-typed client.
- Zod schemas in `src/validation/` validate every form input.

### 5. Feature modules

Domain-specific code (auth forms, profile editing) lives in `src/features/`,
keeping `components/` purely presentational and reusable.

### 6. Server-only data layer (`lib/data/`)

All reads go through `src/lib/data/*` modules (marked `server-only`), which
wrap the Supabase client and return `DataResult<T>` instead of throwing.
Search/directory reads use Postgres RPC functions (security-definer, explicit
field lists) so cross-table filtering and pagination happen in the database
without exposing sensitive columns. Writes go through server actions in
`src/features/*/actions.ts`, which re-validate inputs with Zod and re-check
authorization (`requireProfile` / `requireRole`).

## Future phases

Later phases (messaging, reviews, payments, premium, notifications at scale…)
plug into this foundation without restructuring: new feature modules, new
tables/migrations, and new routes under `(protected)`.
