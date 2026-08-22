# PoraSathi লাইভ সাইট অডিট

**তারিখ:** 2026-08-21  
**লাইভ URL:** https://porasathi.rahatahmed.site/  
**স্কোপ:** পেজ লোড স্লোনেস + পুরো ওয়েবসাইট অডিট (কোড + লাইভ রেন্ডার)

এই সেশনে স্যান্ডবক্স থেকে `curl` দিয়ে TLS (`SSL_ERROR_SYSCALL`) ব্লক ছিল, তাই HTTP টাইমিং মিলিসেকেন্ডে সরাসরি মাপা যায়নি। লাইভ পেজ `fetch` (HTML রেন্ডার), `/api/health`, `/sitemap.xml`, এবং রিপোজিটরির App Router/data layer দিয়ে যাচাই করা হয়েছে। আগের ব্রাউজার-মাপা অডিট (`AUDIT-2026-08-20.md`) এখনো প্রযোজ্য — বিশেষ করে হোমপেজের স্ক্রল jank।

---

## ১. লাইভ স্বাস্থ্য

| চেক | ফল |
|---|---|
| হোমপেজ HTML | ২০০, বাংলা কনটেন্ট, canonical/OG, skip-link |
| `/api/health` | `status: ok`, `supabaseEnvConfigured: true`, `database.reachable: true`, চেক `site_stats` |
| `/sitemap.xml` | প্রোডাকশন HTTPS URL; হোম, teachers, leaderboard, blog, coaching, resources, premium, legal, ১টি teacher profile |
| `/teachers` | ১ জন শিক্ষক (Rahat Ahmed) |
| `/leaderboard` | খালি স্টেট — ভেরিফাইড + সম্পন্ন টিউশন + ৩ রিভিউ থ্রেশহোল্ড পূরণ হয়নি (ডিজাইন অনুযায়ী) |
| হোম লাইভ স্ট্যাট | শিক্ষার্থী ১, শিক্ষক ২, সংযোগ ১, সক্রিয় টিউশন ০, যাচাইকৃত ১, জেলা ১ |

সাইট **ডাউন নয়**। স্লোনেস মূলত **হোমপেজের ক্লায়েন্ট ওয়ার্ক** এবং কয়েকটি **সার্ভার waterfall**, নেটওয়ার্ক আউটএজ নয়।

---

## ২. যে পেজগুলো লোড/ইন্টারঅ্যাক্টে ধীর মনে হয়

ধীরত্ব দুই ধরনের: **সার্ভার TTFB** (HTML আসতে দেরি) এবং **ক্লায়েন্ট jank** (পেজ এসেছে কিন্তু স্ক্রল/অ্যানিমেশন ভারী)।

### 🔴 সবচেয়ে ভারী: `/` (হোম)

**কেন ধীর মনে হয়**

হোমপেজ একসাথে চালায়:

- সার্ভারে ৩টি RPC একসাথে: `home_feed`, `site_stats`, `top_reviews` (`revalidate = 300` — ভালো)
- ক্লায়েন্টে অনেক motion: Hero 3D, Journey coverflow, Featured coverflow, How-it-works scroll-flip deck, Projects deck, PointerTilt, ScrollFan, marquee, parallax blob, Review spotlight, Developer flip card
- আগের মাপে **ডেস্কটপ স্ক্রল ~20 FPS** (median frame 50–67ms, ~৯৫% frame drop)। কারণ: অনেক `backdrop-filter` + sticky header blur + 3D transform — প্রতি স্ক্রল ফ্রেমে blur পুনরায় কম্পোজিট হয়
- মোবাইলে সেই মাপে ~60 FPS ছিল; সমস্যাটা বিশেষ করে **ডেস্কটপ**

**করণীয় (প্রভাব বেশি, ঝুঁকি কম)**

1. Header `backdrop-blur-xl` → `sm` বা প্রায়-অস্বচ্ছ bg দিয়ে blur বাদ  
2. `.pointer-tilt` ও hero-এর ভেতরের `backdrop-blur` সরান  
3. Bottom nav blur সরান  
4. হোমকে সেকশনে ভাগ করুন: above-the-fold ছোট রাখুন; coverflow/deck `dynamic()` বা viewport-এ এলে মাউন্ট  
5. Developer section/projects deck হোমের নিচে রাখলেও JS খরচ আগেই হয় — lazy load করুন  

ISR ৫ মিনিট থাকায় **ক্যাশ হিট** হলে TTFB কম হওয়া উচিত; ব্যবহারকারী যা অনুভব করে সেটা বেশিরভাগ **স্ক্রল/পেইন্ট**, প্রথম বাইট নয়।

### 🟠 `/teachers`

- `getCurrentProfile()` → তারপর `searchTeachers()` → তারপর `listFavoriteTeacherIds()` — **সিরিয়াল waterfall**
- অতিথিদের জন্য profile/favorites দরকার নেই, তবু আগে auth সেশন চেক হয়
- `search_teachers` RPC + অনেক ফিল্টার UI (জেলা/বিষয় সিলেক্ট) — HTML বড়
- Teacher card-এ flip/3D থাকলে তালিকা বাড়লে jank বাড়বে (এখন ১টি কার্ড, তাই হালকা)

**করণীয়:** অতিথি হলে search আগে/একসাথে চালান; favorites শুধু লগইন ইউজারের জন্য। Filter UI কে client island রাখুন, সার্ভার HTML ছোট রাখুন।

### 🟠 `/tuitions`

- লগইন না থাকলে সার্ভারে `getCurrentUser()` এর পর “লগইন প্রয়োজন” — extra round-trip
- লগইন থাকলে `searchTuitions` + ফিল্টার
- আগের অডিট: ডেস্কটপ ~৩৩ms/frame (৫০% drop), CLS 0.106 খালি স্টেটে footer shift
- `robots: noindex` — SEO লোড নয়, UX লোড হ্যাঁ

### 🟡 `/resources`, `/coaching`, `/blog`

- তুলনায় হালকা
- `/resources` আগে ডেস্কটপে ~৩৩ms frame (backdrop)
- খালি/কম কনটেন্টে footer উপরে উঠে CLS হতে পারে

### 🟡 `/teachers/[id]` (প্রোফাইল)

- `get_public_teacher` + সম্ভবত recommend RPC
- এক প্রোফাইল — ঠিক আছে যতক্ষণ ছবি external host (Drive/Dropbox) ধীর না হয়
- External image: referrer নেই, fail হলে initials — ভালো; Drive থাম্বনেইল ধীর হতে পারে

### 🟢 সাধারণত দ্রুত

`/login`, `/register`, `/safety`, `/privacy`, `/terms`, `/verification`, `/contact`, `/premium`, `/leaderboard` (খালি), `/api/health`

### 🔒 লগইন গেট (লোড নয়, রিডাইরেক্ট)

`/dashboard`, `/messages`, `/account`, `/admin` → লগইন। Dashboard তারপর আবার `/dashboard/{role}` — **ডাবল রিডাইরেক্ট** (অতিরিক্ত রাউন্ড-ট্রিপ)।

---

## ৩. পারফরম্যান্স রুট-কজ সারাংশ

| কারণ | কোথায় | প্রভাব |
|---|---|---|
| অনেক `backdrop-filter` + sticky header | হোম, tuitions, resources | ডেস্কটপ স্ক্রল jank |
| ৩–৪টি 3D carousel/deck এক পেজে | হোম | JS + GPU |
| Auth → data সিরিয়াল | teachers, tuitions, dashboard | TTFB waterfall |
| Dashboard index দ্বৈত redirect | `/dashboard` | অনুভূত স্লোনেস |
| Header সব পেজে client (hide-on-scroll) | layout | প্রতি পেজে JS |
| VisitorTracker + SW | layout | অতিরিক্ত নেটওয়ার্ক |
| External profile photos | teacher cards | থার্ড-পার্টি লেটেন্সি |
| খালি পেজে footer CLS | tuitions | SEO/UX |

যা **ভালো আছে:** `homeFeed`/`siteStats`/`topReviews` `Promise.all`; হোম `revalidate=300`; public DB client cache hints (120–300s); Supabase `preconnect`; `poweredByHeader: false`; skip link; loading.tsx অনেক রুটে।

---

## ৪. পুরো সাইট অডিট

### ৪.১ কার্যকারিতা ও কনটেন্ট

- মার্কেটপ্লেস স্টোরি পরিষ্কার: Discover → Match → Connect → Manage → Trust
- পাবলিক ডিসকভারি লগইন ছাড়া কাজ করে (`/teachers`)
- যোগাযোগ/টিউশন তালিকা লগইন চায় — সুরক্ষা ঠিক
- লিডারবোর্ড খালি — থ্রেশহোল্ড কঠোর; নতুন প্ল্যাটফর্মে ঠিক, কিন্তু ভিজিটর “ভাঙা” মনে করতে পারে। খালি স্টেটে “কীভাবে র‍্যাঙ্ক হয়” আরও স্পষ্ট (এখন আছে)
- হোমে শিক্ষক ২ vs সার্চে ১ — সম্ভবত একজন unpublished/অসম্পূর্ণ প্রোফাইল; verwirrung হতে পারে
- `/demo` sitemap/nav-এ নেই কিন্তু পাবলিক — আগের সুপারিশ: `noindex`

### ৪.২ UX / UI (আগের অডিট, কোডে এখনো প্রাসঙ্গিক)

| ID | সমস্যা | সিভিয়ারিটি |
|---|---|---|
| A1 | Developer flip card ব্যাক ফেস CTA কাটা | 🔴 |
| A2 | Projects deck মোবাইলে CTA কাটা | 🔴 |
| A3 | Premium WhatsApp বাটন 320px-এ কাটা | 🟠 |
| A4 | `/demo` short screen কাটা | 🟡 |
| B2 | Header হাইড হলে deck-এ ৬৪px ফাঁকা | 🟠 |
| B3 | Featured coverflow reduced-motion উপেক্ষা | 🟠 a11y |
| B4 | Deck কন্ট্রোল bottom-nav-এর পেছনে | 🟡 |
| C1 | Toast-এ `dark:` নেই | 🟠 |
| C4 | `/demo` canonical/noindex নেই | 🟡 |

### ৪.৩ অ্যাক্সেসিবিলিটি

- `lang="bn"`, skip link, ফোকাস রিং অনেক জায়গায়
- Coverflow autoplay WCAG 2.2.2 ভাঙতে পারে (pause/reduced-motion)
- অনেক অ্যানিমেশন; reduced-motion CSS সাধারণত সম্মানিত, featured coverflow ব্যতিক্রম
- ফর্ম লেবেল শিক্ষক ফিল্টারে আছে

### ৪.৪ SEO

- Metadata, canonical, sitemap, robots, JSON-LD Organization/WebSite
- `/tuitions` noindex — ইচ্ছাকৃত
- ওপেন গ্রাফ ইমেজ শুধু ৫১২px আইকন — শেয়ার প্রিভিউ দুর্বল; আলাদা 1200×630 OG চাই
- কনটেন্ট পাতলা (১ শিক্ষক, ০ টিউশন) — সার্চ র‍্যাঙ্ক ডেটার অভাবে সীমিত

### ৪.৫ সিকিউরিটি (কোড + কনফিগ)

ভালো:

- CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy
- `frame-ancestors` সীমিত (self + rahatahmed.site + e2b + localhost)
- Service role কী ব্রাউজারে নয় (README)
- Tuition ID enumeration: অজানা UUID-তে ৪০৪ না দিয়ে লগইন পেজ — তথ্য ফাঁস কমায়
- Message retention ৪৮ ঘণ্টা (মাইগ্রেশন)

নোট:

- CSP-এ `script-src 'unsafe-inline'` (Next ইনলাইন/থিম স্ক্রিপ্ট) — সাধারণ, কিন্তু nonce-এ গেলে ভালো
- `img-src https:` চওড়া — যেকোনো HTTPS ইমেজ; প্রোফাইল URL গার্ড আছে কি না যাচাই রাখুন
- Admin রুট সার্ভার-সাইড রোল চেক — কোড প্যাটার্ন ঠিক; পেনিট্রেশন এই সেশনে হয়নি

### ৪.৬ আর্কিটেকচার

- Next.js 16 App Router, Supabase RPC, RLS
- Public vs auth DB ক্লায়েন্ট আলাদা
- Health চেক `site_stats` দিয়ে DB যাচাই — প্রোড `ok`

### ৪.৭ PWA

- `sw.js`, `offline.html`, manifest — README স্মোক লিস্টে আছে
- SW ক্যাশ ভুল হলে আপডেট ধীর মনে হতে পারে; ভার্সন বাস্ট নিশ্চিত করুন

---

## ৫. অগ্রাধিকার

1. **হোম GPU jank** — backdrop-blur কমানো (সবচেয়ে দৃশ্যমান “স্লো পেজ”)
2. **হোম JS ভাঙা** — deck/coverflow lazy
3. **Teachers waterfall** — অতিথির জন্য auth আগে না
4. **Dashboard দ্বৈত redirect** — সরাসরি রোল রুটে
5. **কাটা CTA** (flip card, projects deck, premium 320px)
6. **Coverflow reduced-motion + pause**
7. **Toast dark mode**
8. **OG ইমেজ 1200×630**
9. **`/demo` noindex**
10. **Tuitions empty min-height** (CLS)

---

## ৬. পরিমাপ সীমাবদ্ধতা

- এই এজেন্ট এনভায়রনমেন্টে আউটবাউন্ড HTTPS `curl` ব্যর্থ; লাইভ HTML `fetch_page` দিয়ে পাওয়া গেছে
- Lighthouse/CrUX এই রানে চালানো যায়নি
- লগইন-পরবর্তী dashboard/messages পারফরম্যান্স মাপা হয়নি
- ফ্রেম-রেট সংখ্যা 2026-08-20 Chromium অডিট থেকে; কোডে সেই blur/3D এখনো আছে বলে একই ঝুঁকি ধরে নেওয়া হয়েছে

প্রোডাকশনে নিশ্চিত করতে: Chrome DevTools Network (Disable cache) + Performance, এবং Vercel Analytics/Speed Insights TTFB vs INP আলাদা করে দেখুন। হোমপেজে আশা: **INP/স্ক্রল খারাপ, TTFB ISR-এ মোটামুটি ঠিক**।
