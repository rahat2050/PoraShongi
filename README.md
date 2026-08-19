# PoraSathi · পড়াসাথী

> **সঠিক শিক্ষক, সুন্দর শেখার সঙ্গী** · **A platform by FS Coaching**

বাংলাদেশের শিক্ষার্থী/অভিভাবক এবং যোগ্য শিক্ষককে যুক্ত করার ডিজিটাল প্ল্যাটফর্ম।

## Tech stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL + Auth + Row Level Security)
- **Hosting:** Vercel
- **Runtime:** Node.js **22 or later**

## Local setup

### 1. Install

```bash
npm ci
cp .env.example .env.local
```

`.env.local`-এ Supabase URL এবং anon key দিন। Local share/metadata URL দরকার হলে:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Database migrations

Supabase CLI ব্যবহার করাই নিরাপদ:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

SQL Editor দিয়ে করলে `supabase/migrations`-এর ফাইলগুলো **ফাইলনামের ক্রমে** চালান। Existing production database-এ audit fixes চালাতে অন্তত নিচের নতুন migration-গুলো ক্রমে প্রয়োগ করতে হবে:

1. `0013_location_search.sql`
2. `0014_trusted_leaderboard.sql`
3. `0015_public_content_read.sql`
4. `0016_profile_publication.sql`

Migration প্রয়োগ না করলে নতুন UI deploy হলেও location filtering, leaderboard, public content policy এবং profile publication rules ঠিক হবে না। ৪৮ ঘণ্টার message auto-delete চালু করতে `0025_message_retention.sql`-ও প্রয়োগ করা বাধ্যতামূলক। সিকিউরিটি হার্ডনিংয়ের জন্য `0030_security_hardening.sql` অবশ্যই প্রয়োগ করুন (meeting link/student ID লিক, review tampering, admin analytics guard, tuition state machine, message rate limit)। আগে database backup নিন।

### 3. Run

```bash
npm run dev
```

- App: http://localhost:3000
- Health check: http://localhost:3000/api/health

## Production environment

Vercel Production environment-এ সেট করুন:

```env
NEXT_PUBLIC_SITE_URL=https://porasathi.rahatahmed.site
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=server-only-key-if-required
```

`SUPABASE_SERVICE_ROLE_KEY` কখনো browser variable বা Git repository-তে রাখবেন না।

### External profile photos

PoraSathi কোনো profile image file upload বা store করে না। ব্যবহারকারী Google Drive, Dropbox অথবা অন্য public HTTPS host-এ ছবি রেখে share/direct link দেন; database-এ শুধু URL text সংরক্ষিত হয়।

- Google Drive file-এর sharing অবশ্যই `Anyone with the link` করতে হবে।
- Google Drive share links স্বয়ংক্রিয়ভাবে renderable thumbnail URL-এ রূপান্তর হয়।
- Dropbox share links স্বয়ংক্রিয়ভাবে raw-image mode ব্যবহার করে।
- শুধু public HTTPS URL গ্রহণ করা হয়; localhost/private-network URL প্রত্যাখ্যান করা হয়।
- External image request-এ browser referrer পাঠায় না এবং image load ব্যর্থ হলে initials fallback দেখা যায়।

### Realtime chat and 48-hour retention

`0025_message_retention.sql` প্রয়োগ করলে chat message ৪৮ ঘণ্টা পর Supabase থেকে মুছে যায়। Migration-টি:

- `created_at` retention index যোগ করে;
- প্রতি message insert-এর পরে indexed cleanup চালায়;
- hosted Supabase-এ `pg_cron` পাওয়া গেলে hourly cleanup schedule করে;
- cleanup-এর পরে conversation-এর `last_message_at` ঠিক করে।

UI পুরোনো message fetch করে না এবং Realtime subscription ব্যবহার করে; ২০-সেকেন্ডের full-page polling আর প্রয়োজন হয় না। গুরুত্বপূর্ণ তথ্য chat history-এর বাইরে সংরক্ষণ করতে ব্যবহারকারীকে জানানো হয়।

## Quality checks

প্রতিটি pull request/deploy-এর আগে:

```bash
npm run typecheck
npm run lint
npm run build
```

Manual smoke checks:

1. `/robots.txt` ও `/sitemap.xml`-এ production HTTPS URL আছে।
2. Teacher share/copy URL production domain ব্যবহার করে।
3. `/login?next=/teachers/...` login শেষে একই page-এ ফেরে।
4. Light ও dark mode-এ homepage, search, auth এবং profile পড়া যায়।
5. Empty auth form কোনো Supabase request পাঠায় না।
6. Invalid teacher ID HTTP 404 দেয়।
7. Mobile bottom navigation, filter drawer ও back-to-top overlap করে না।
8. `/.well-known/security.txt`, `/sw.js` ও `/offline.html` HTTP 200 দেয়।

## Scripts

| Command | কাজ |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Location and matching

- Teacher profile-এ district + area থাকে; optional approximate GPS private থাকে।
- Radius/nearest search কেবল signed-in profile-এ valid coordinates থাকলে চালু হয়।
- Offline/both teacher location ছাড়া public search-এ প্রকাশিত হয় না।
- Online-only teacher district ছাড়াও প্রকাশিত হতে পারে।
- Match score rule-based; এটি নিশ্চয়তা নয়।

## Security and trust

- Public profiles publication threshold পূরণ করলে search-এ আসে।
- Leaderboard-এ verified teacher-এর কমপক্ষে ১টি completed tuition এবং ৩টি review দরকার।
- Auth/private routes `noindex` এবং server-side protected।
- Privacy, terms, safety and verification pages are linked in the footer.
- Secrets কখনো commit করবেন না। Exposed credentials immediately revoke and rotate করুন।
