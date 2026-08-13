# Setup

Complete local setup guide.

## Prerequisites

- Node.js ≥ 20.9 (22.x recommended)
- npm
- Supabase project (see `docs/supabase-setup.md`)
- Cloudinary account (optional — see `docs/cloudinary-setup.md`)

## Step-by-step

```bash
# 1. Clone
git clone https://github.com/rahat2050/PoraShongi.git
cd PoraShongi

# 2. Switch to the phase branch (Phase 1)
git checkout PHASE-1-FOUNDATION-ARCHITECTURE

# 3. Install
npm install

# 4. Environment
cp .env.example .env.local
# edit .env.local with real values

# 5. Database
# Run supabase/migrations/*.sql in the Supabase SQL editor

# 6. Develop
npm run dev
# → http://localhost:3000
```

## Build & quality gates

```bash
npm run lint
npm run typecheck
npm run build
```

## Health check

With the dev server running:

```bash
curl http://localhost:3000/api/health
```

Returns app name, phase, and whether Supabase/Cloudinary are configured.
