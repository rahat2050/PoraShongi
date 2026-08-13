# PoraShongi · পড়াসঙ্গী

> **পড়াশোনার সঠিক সঙ্গী** — The Right Companion for Your Studies

A Bangladesh-focused **teacher–student tuition marketplace** and education
ecosystem. PoraShongi connects students, guardians and qualified teachers —
starting in Sunamganj / Sylhet, with a vision for all of Bangladesh.

**Current status:** Phase 3 — Core Platform & Trust ✅
(Phase 1 Foundation & Phase 2 MVP: complete)

---

## Tech stack

| Layer     | Technology                                        |
| --------- | ------------------------------------------------- |
| Frontend  | [Next.js 16](https://nextjs.org) (App Router), TypeScript, Tailwind CSS v4 |
| Backend   | [Supabase](https://supabase.com) (PostgreSQL, Auth, Row Level Security) |
| Media     | [Cloudinary](https://cloudinary.com) (profile images) |
| Hosting   | Vercel                                            |
| Version control | GitHub                                       |

---

## What's included

### Marketplace (Phase 2)

- **Profiles** — student, teacher and guardian profiles (role-specific fields,
  profile completion %, avatar via Cloudinary).
- **Tuition posting** — students/guardians create tuition requirements;
  teachers manage their own listings (pause / complete / close / delete).
- **Teacher discovery** — public, paginated teacher search with filters
  (class, subject, location, mode, experience, verification).
- **Tuition search** — paginated search with class/subject/location/budget/
  mode/day/time filters.
- **Tuition requests** — student/guardian → teacher, with accept / reject /
  withdraw and duplicate-active-request prevention.
- **Dashboards** — role-aware dashboards for students, teachers and guardians.
- **Favorites** — students/guardians save teachers.
- **Basic notifications** — in-app notifications for new request, accepted
  and rejected (via database triggers + realtime).
- **Trust & verification** — phone verified, education verified, admin-managed
  verification status.
- **Admin MVP** — users, teachers, students, guardians, tuitions, requests and
  verification management.

### Core platform & trust (Phase 3)

- **Smart matching** — deterministic, explainable scores ("92% Match").
- **Advanced teacher discovery** — gender, rating, availability filters +
  sorting (relevance, best match, rating, experience, newest).
- **Schedule** — sessions with daily/weekly views; attendance
  (present/absent/cancelled/rescheduled); in-app reminders.
- **Lightweight messaging** — conversations, unread counts, read receipts,
  blocking, reporting (strict RLS).
- **Reviews & ratings** — verified reviews after accepted tuitions,
  efficient rating counters, admin moderation.
- **Verification tiers** — unverified → phone → education → identity →
  trusted tutor (admin managed).
- **Child safety** — minor privacy redaction, guardian consent, reporting,
  blocking, safety guidelines.
- **Reporting & moderation** — report any entity; admin investigate/resolve.
- **Notification preferences** + no-match "notify me" alerts.
- **Teacher reputation** — transparent indicators (rating, completion,
  response & cancellation behavior).

---

## Getting started

### 1. Prerequisites

- Node.js ≥ 20.9 (22.x recommended)
- npm
- A free [Supabase](https://database.new) project
- A free [Cloudinary](https://cloudinary.com) account (optional, for avatar uploads)

### 2. Install & configure

```bash
npm install
cp .env.example .env.local
# → edit .env.local with your Supabase & Cloudinary keys
```

### 3. Set up the database

Run the SQL migrations in `supabase/migrations/` **in order** in your Supabase
project's SQL editor:

1. `20260813000001_init.sql` — Phase 1 foundation
2. `20260813000002_mvp.sql` — Phase 2 marketplace
3. `20260813000003_trust.sql` — Phase 3 core platform & trust

See `supabase/README.md` and `docs/supabase-setup.md`.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start the development server              |
| `npm run build`     | Production build                          |
| `npm run start`     | Serve the production build                |
| `npm run lint`      | Run ESLint                                |
| `npm run typecheck` | Run TypeScript type-checking (`tsc --noEmit`) |

---

## Documentation

| Document                          | Covers                                            |
| --------------------------------- | ------------------------------------------------- |
| [docs/branding.md](docs/branding.md)               | Brand, name, tagline, design system                |
| [docs/architecture.md](docs/architecture.md)       | Folder structure & architectural decisions         |
| [docs/mvp.md](docs/mvp.md)                         | Phase 2 data model & core flows                    |
| [docs/trust.md](docs/trust.md)                     | Phase 3 matching, safety, messaging, reviews, moderation |
| [docs/setup.md](docs/setup.md)                     | Full local setup walkthrough                       |
| [docs/environment-variables.md](docs/environment-variables.md) | Every env var explained        |
| [docs/supabase-setup.md](docs/supabase-setup.md)   | Project, migrations, auth & RLS setup              |
| [docs/cloudinary-setup.md](docs/cloudinary-setup.md)| Upload preset & optimized image handling           |
| [docs/git-workflow.md](docs/git-workflow.md)       | Phase-based branch workflow                        |

---

## Git workflow

Development is strictly **phase-based** — one phase at a time, each on its own
branch (e.g. `PHASE-2-MVP-MARKETPLACE`), pushed and opened as a Pull Request
against `main`. PRs are **not** merged until review. See
[docs/git-workflow.md](docs/git-workflow.md).

---

## License

Private project — all rights reserved.
