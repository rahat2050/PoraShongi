# PoraShongi · পড়াসঙ্গী

> **পড়াশোনার সঠিক সঙ্গী** — The Right Companion for Your Studies

A Bangladesh-focused **teacher–student tuition marketplace** and education
ecosystem. PoraShongi connects students, guardians and qualified teachers —
starting in Sunamganj / Sylhet, with a vision for all of Bangladesh.

**Current status:** Phase 1 — Foundation & Architecture ✅

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

## Getting started

### 1. Prerequisites

- Node.js ≥ 20.9 (22.x recommended)
- npm
- A free [Supabase](https://database.new) project
- A free [Cloudinary](https://cloudinary.com) account (optional, for avatar uploads)

### 2. Install & configure

```bash
# install dependencies
npm install

# configure environment variables
cp .env.example .env.local
# → edit .env.local with your Supabase & Cloudinary keys
```

### 3. Set up the database

Run the SQL migration in `supabase/migrations/` in your Supabase project's
SQL editor. See `supabase/README.md` and `docs/supabase-setup.md`.

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
| [docs/setup.md](docs/setup.md)                     | Full local setup walkthrough                       |
| [docs/environment-variables.md](docs/environment-variables.md) | Every env var explained        |
| [docs/supabase-setup.md](docs/supabase-setup.md)   | Project, migrations, auth & RLS setup              |
| [docs/cloudinary-setup.md](docs/cloudinary-setup.md)| Upload preset & optimized image handling           |
| [docs/git-workflow.md](docs/git-workflow.md)       | Phase-based branch workflow                        |

---

## Git workflow

Development is strictly **phase-based** — one phase at a time, each on its own
branch (e.g. `PHASE-1-FOUNDATION-ARCHITECTURE`), pushed and opened as a Pull
Request against `main`. PRs are **not** merged until review. See
[docs/git-workflow.md](docs/git-workflow.md).

---

## License

Private project — all rights reserved.
