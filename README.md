# PoraSathi · পড়াসাথী

> **সঠিক শিক্ষক, সুন্দর শেখার সঙ্গী**
>
> **A platform by FS Coaching**

বাংলাদেশের শিক্ষার্থী/অভিভাবক এবং যোগ্য শিক্ষককে যুক্ত করার trusted digital platform।

## Tech stack
- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL + Auth + Row Level Security)
- **Hosting:** Vercel

## Development phases

| Phase | Scope | Status |
|---|---|---|
| 🔵 BP1 — Backend Foundation & Auth | profiles + role profiles + RLS + auth triggers | ✅ |
| 🔵 BP2 — Backend Marketplace + Matching | tuitions, requests, favorites, notifications, search + distance matching | ✅ |
| 🟢 FP1 — Frontend Design + Auth UI | branding, UI components, landing, login/register/forgot | ✅ |
| 🟢 FP2 — Frontend Interactive Features | profile forms, tuition, search, request, dashboards | ⏳ |

## Setup (ধাপে ধাপে)

### 1. Supabase project বানাও
1. [database.new](https://database.new) → **New project**
2. **SQL Editor** → New query → নিচের ২টা ফাইল **এই অর্ডারে** চালাও:
   - `supabase/migrations/0001_foundation.sql`
   - `supabase/migrations/0002_marketplace.sql`

### 2. Environment variables
```bash
cp .env.example .env.local
```
`.env.local`-এ বসাও:
- `NEXT_PUBLIC_SUPABASE_URL` → Supabase → Project Settings → API → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Supabase → Project Settings → API → anon public key

### 3. চালাও
```bash
npm install
npm run dev
```
- অ্যাপ: http://localhost:3000
- **Supabase connection চেক:** http://localhost:3000/api/health

`/api/health`-এ `database.reachable: true` দেখালে সব ঠিক ✅

## Scripts
| Command | কাজ |
|---|---|
| `npm run dev` | ডেভেলপমেন্ট সার্ভার |
| `npm run build` | প্রোডাকশন বিল্ড |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript চেক |

## দূরত্ব / কাছে-দূরে (distance) কীভাবে কাজ করে
- Teacher/tuition-এ `district` + `area` (থানা/উপজেলা) থাকে, চাইলে approximate GPS (lat/lng — private, কখনো public না)
- Search-এ distance radius filter + **Nearest sort** আছে
- Match score-এ proximity: একই এলাকা = বেশি স্কোর, একই জেলা = মাঝারি, দূরে = কম; Online হলে distance প্রযোজ্য না

## সুপারিশ
- Node.js 22
- Secrets কখনো commit করো না (`.env*` gitignore করা)
