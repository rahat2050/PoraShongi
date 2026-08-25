# প্রতিযোগী বিশ্লেষণ ও ফিচার গ্যাপ লিস্ট

**তারিখ:** 2026-08-23
**আমাদের সাইট:** PoraSathi (পড়াসাথী) — `https://porasathi.rahatahmed.site`
**তুলনা করা সাইট:**

| # | সাইট | ধরন | মূল শক্তি |
|---|---|---|---|
| A | [eudika.com](https://eudika.com/) | Next.js marketplace, ৩৯.৬K টিউটর | SEO landing pages, lead funnel, free demo, guarantee |
| B | [tuitionterminal.com.bd](https://tuitionterminal.com.bd/) | ২০১৫ থেকে চালু, Android app আছে | Trust signals, affiliate program, press coverage, hotline |
| C | [tuitionmedia.bd](https://tuitionmedia.bd/) | PHP প্ল্যাটফর্ম | Tutor gigs, escrow, points/merch shop, careers |

> **স্কোপ নোট:** এই ডকুমেন্টে কোনো কোড লেখা হয়নি — এটি শুধু গ্যাপ লিস্ট + রোডম্যাপ। ইমপ্লিমেন্টেশন পরের ধাপে, তোমার অনুমোদিত অগ্রাধিকার অনুযায়ী।

---

## ০. ইমপ্লিমেন্টেশন স্ট্যাটাস (হালনাগাদ: 2026-08-25)

নিচের রোডম্যাপের কোন ধাপ কোডে নেমেছে, তার যাচাইকৃত অবস্থা:

| ধাপ | আইটেম | অবস্থা | কোথায় |
|---|---|---|---|
| ১ | `/hire-tutor` পাবলিক লিড ফর্ম + `/admin/leads` | ✅ হয়েছে | `src/app/hire-tutor`, `0033_public_tutor_leads.sql` |
| ১ | `/tuitions` আংশিক পাবলিক + JobPosting | ✅ হয়েছে | `0034_public_tuition_listing.sql` |
| ১ | হোমে লাইভ টিউশন ফিড | ✅ হয়েছে | `components/home/live-tuition-feed.tsx` |
| ১ | ফ্রি ডেমো ব্যাজ + ফিল্টার | ✅ হয়েছে | `teacher-card.tsx`, `teacher-filters.tsx`, `0032_trial_discovery.sql` |
| ২ | ফুটার হটলাইন / WhatsApp / সোশ্যাল / ঠিকানা | ✅ হয়েছে | `config/site.ts` (`contactConfig`), `footer.tsx` |
| ২ | `/app` PWA পেজ + QR + install prompt | ✅ হয়েছে | `src/app/app`, `lib/qr.ts` |
| ২ | `/affiliate` পাবলিক পেজ | ✅ হয়েছে | `src/app/affiliate` |
| ২ | পেমেন্ট ব্যাজ (bKash/Nagad/Rocket) | ✅ হয়েছে | `config/site.ts` (`paymentMethods`) |
| ২ | Trust strip (সৎ কনটেন্ট) | ✅ হয়েছে | `config/site.ts` (`trustPillars`) |
| ৩ | **৬৪ জেলার ল্যান্ডিং পেজ** | ✅ **এই ধাপে হয়েছে** | `config/districts.ts`, `/teachers/<জেলা>` |
| ৩ | **পরীক্ষা/শ্রেণি ল্যান্ডিং** (SSC/HSC/ভর্তি…) | ✅ **এই ধাপে হয়েছে** | `config/seo.ts` (`EXAM_LANDINGS`), `/exams/[slug]` |
| ৩ | **হোমে keyword লিংক স্ট্রিপ** (Eudika-র ২৪ লিংক) | ✅ **এই ধাপে হয়েছে** | `components/seo/trending-strip.tsx` (৩১টি ল্যান্ডিং লিংক) |
| ৩ | thin-content গার্ড (খালি পেজ noindex) | ✅ **এই ধাপে হয়েছে** | `directory-landing-page.tsx`, `sitemap.ts` |
| ৩ | `/locations` পূর্ণ জেলা-ডিরেক্টরি | ✅ **এই ধাপে হয়েছে** | `src/app/locations/page.tsx` |
| ৬ | প্রতিষ্ঠান ব্যাজ (DU/BUET) | ✅ হয়েছে | `teacher-card.tsx` (`notableInstitution`) |
| ৬ | টিউশন কার্ডে "নতুন" ব্যাজ | ✅ হয়েছে | `tuition-teaser-card.tsx` |
| ৬ | দুই আলাদা ফানেল (অভিভাবক vs শিক্ষক) | ✅ হয়েছে | `/how-it-works` |
| ৪ | Careers / Team পেজ | ✅ হয়েছে | `src/app/careers` |
| ৫ | মাধ্যম-ভিত্তিক ল্যান্ডিং (English Medium, O/A Level) | ❌ বাকি | `teacher_profiles`-এ `medium` কলাম নেই — migration লাগবে |
| ৫ | প্রতিষ্ঠান-ভিত্তিক ল্যান্ডিং (BUET/DU টিউটর) | ❌ বাকি | `institution` কলাম আছে, কিন্তু `search_teachers`-এ ফিল্টার নেই |
| ৪ | **Tutor Gigs** (fixed-price প্যাকেজ) | ❌ বাকি | নতুন টেবিল + CRUD — সবচেয়ে বড় বাকি আইটেম |
| ৩ | ভিডিও টেস্টিমোনিয়াল | ❌ বাকি | `reviews`-এ `video_url` কলাম লাগবে |
| ৬ | "X জন শিক্ষার্থী পড়িয়েছেন" স্ট্যাট | ❌ বাকি | আমাদের `classes_taught` টেক্সট অ্যারে, সংখ্যা নয় |
| ৬ | অনলাইন ইন্ডিকেটর | ⚠️ ইচ্ছাকৃতভাবে বাদ | §৯ দেখুন — ভুয়া সংখ্যা দেখাব না |
| ৪ | Points / মার্চ শপ | ❌ বাকি (কম অগ্রাধিকার) | |

**যা এই ধাপে যাচাই করা হয়েছে:** ৬৪ জেলার প্রতিটি URL 200 দেয়, সম্বন্ধ পদ সঠিক
(ঢাকার / ফেনীর / নওগাঁর / ঠাকুরগাঁওর), অজানা স্লাগ 404, UUID এখনো শিক্ষক প্রোফাইলে যায়,
আর যে জেলা/শ্রেণিতে প্রকাশিত শিক্ষক নেই সেই পেজ `noindex` হয় ও sitemap-এ আসে না।

---

## ১. আগে দেখে নাও — PoraSathi-তে যা **ইতিমধ্যে আছে**

গ্যাপ লিস্ট পড়ার আগে এটা জরুরি, কারণ অনেক প্রতিযোগী-ফিচার আমাদের আগেই আছে (কখনো ভালো অবস্থায়):

| ফিচার | আমাদের অবস্থা | প্রতিযোগীদের তুলনায় |
|---|---|---|
| শিক্ষক খোঁজা + ফিল্টার | `/teachers` — ক্লাস, বিষয়, জেলা, এলাকা, মোড, জেন্ডার, অভিজ্ঞতা, রেটিং, verified, sort | ✅ সমান বা ভালো |
| **দূরত্ব-ভিত্তিক (radius) সার্চ** | `/teachers?radius=` — ২/৫/১০/১৫ কিমি, GPS | 🏆 **তিনটার কোনোটিতেই নেই** |
| টিউশন জব বোর্ড | `/tuitions` (login-gated) | ⚠️ আছে কিন্তু public নয় (নিচে §2.1 দেখো) |
| রিভিউ + রেটিং | `reviews` টেবিল, `/leaderboard`, home spotlight | ✅ Eudika-র সমান |
| ভেরিফিকেশন টিয়ার | phone / education / identity / trusted_tutor | 🏆 **সবচেয়ে বিস্তারিত** |
| রিয়েলটাইম চ্যাট | Supabase Realtime + ৪৮ ঘণ্টা auto-delete | 🏆 কারও নেই |
| Premium | `/premium` — ৳১০০/৩০ দিন, WhatsApp activation | ✅ আছে |
| রেফারেল | `referrals` টেবিল + `/dashboard/referrals` | ✅ আছে |
| ব্লগ / কোচিং / রিসোর্স | `/blog`, `/coaching`, `/resources` + RSS | 🏆 কারও ব্লগ RSS নেই |
| SEO landing pages | `/subjects/[slug]`, `/teachers/sunamganj`, `/teachers/sylhet`, `/teachers/online` | ⚠️ আছে কিন্তু কম (§2.2) |
| PWA | manifest + `sw.js` + `offline.html` | ⚠️ আছে কিন্তু প্রচার নেই (§3.2) |
| অ্যাকাউন্ট export / delete | `/account/export`, `/account/delete` | 🏆 GDPR-grade, কারও নেই |
| Admin panel | analytics, audit, reports, users, tuitions | 🏆 সবচেয়ে সম্পূর্ণ |
| Dark mode | ✅ পুরো সাইটে | 🏆 কারও নেই |

**সারাংশ:** আমাদের **প্রোডাক্ট ইঞ্জিন প্রতিযোগীদের চেয়ে এগিয়ে**। যা নেই তা মূলত **conversion funnel** (লগইন ছাড়া লিড নেওয়া), **trust theatre** (press, hotline, app badge) আর **monetization surface** (gigs, affiliate)।

---

## ২. 🔴 P0 — সবচেয়ে বেশি রেভিনিউ/গ্রোথ প্রভাব

### 2.1 পাবলিক "শিক্ষক চাই" লিড ফর্ম (লগইন ছাড়া)

**কে করছে:** তিনটাই।
- Eudika: হোমে বড় করে `Request For Tutor` বাটন → `/lead/...`
- Tuition Terminal: `Appoint A Tutor` → `/hire-tutor-form`, তারপর "Get Tutors' CV"
- Tuition Media: `Post a Job` — "It takes less than 2 minutes"

**আমাদের গ্যাপ:** টিউশন পোস্ট করতে হলে **রেজিস্টার → ইমেইল ভেরিফাই → প্রোফাইল → `/dashboard/tuitions/new`** — ৪ ধাপ। একজন অভিভাবক যিনি প্রথমবার সাইটে এলেন, তিনি ঝরে যাবেন। এটাই **সবচেয়ে বড় একক গ্যাপ**।

**করণীয়:**
- `/hire-tutor` — পাবলিক, লগইন-ফ্রি ফর্ম: ক্লাস, বিষয়, এলাকা/জেলা, দিন/সময়, বাজেট, ফোন, নাম
- ফোন OTP নয় — শুধু ফোন + honeypot + rate limit (spam ঠেকাতে `pending_request_count`-এর মতো helper)
- সাবমিটের পর: "আপনার অনুরোধ পেয়েছি" + অ্যাকাউন্ট খোলার নরম CTA (claim flow)
- Admin panel-এ নতুন ট্যাব `/admin/leads` — status: new / contacted / matched / closed
- পরে অ্যাকাউন্ট খুললে ফোন মিলিয়ে লিডকে আসল `tuitions` রেকর্ডে রূপান্তর

**DB:** নতুন migration `0032_public_tutor_leads.sql`
- `tutor_leads` টেবিল (anon insert RLS, admin-only read)
- `submit_tutor_lead(...)` RPC — rate limit + validation server-side
- `claim_lead_by_phone(...)` — রেজিস্ট্রেশনের পর লিড→tuition রূপান্তর

**প্রভাব:** 🔴 সর্বোচ্চ · **খাটুনি:** মাঝারি (২–৩ দিন)

---

### 2.2 `/tuitions` পাবলিক করা (আংশিক)

**কে করছে:** তিনটাই টিউশন জব পাবলিক দেখায়। Tuition Media হোমপেজেই "Latest Tuition Jobs" কার্ড দেখায় — ক্লাস, বিষয়, লোকেশন, **৳৬,০০০/মাস** ফি সহ। Tuition Terminal-এ "Live Tuition Jobs" কাউন্টার।

**আমাদের গ্যাপ:** `src/app/tuitions/(index)/page.tsx`-এ `robots: { index: false }` + লগইন গেট। ফলে —
- Google-এ আমাদের একটাও টিউশন জব ইনডেক্স হয় না
- নতুন শিক্ষক দেখতেই পারেন না প্ল্যাটফর্মে কাজ আছে কিনা → রেজিস্টার করেন না
- হোমপেজে "সক্রিয় টিউশন" সংখ্যা দেখায় কিন্তু ক্লিক করলে লগইন ওয়াল

**করণীয় (privacy বজায় রেখে):**
- পাবলিক ভিউতে দেখাবে: ক্লাস, বিষয়, **জেলা + এলাকা (থানা লেভেল, exact ঠিকানা নয়)**, দিন/সময়, বাজেট রেঞ্জ, পোস্টের তারিখ
- **লুকানো থাকবে:** পোস্টদাতার নাম, ফোন, exact ঠিকানা, meeting link
- "আবেদন করুন" বাটনে ক্লিক → `/login?next=/tuitions/{id}` (soft gate)
- `/tuitions` ও `/tuitions/[id]`-তে `index: true` + JobPosting JSON-LD

**DB:** `0033_public_tuition_listing.sql` — `public_tuitions()` RPC যেটা শুধু নিরাপদ কলাম রিটার্ন করে

**প্রভাব:** 🔴 সর্বোচ্চ (SEO + শিক্ষক acquisition) · **খাটুনি:** মাঝারি (২ দিন)

---

### 2.3 ফ্রি ডেমো / ট্রায়াল ক্লাস — visible করা

**কে করছে:** Eudika-র ৩-ধাপের ফানেলের **পুরো মাঝখানের ধাপ**: "Free Demo — Take a free live interview with our Tutors and see if they are the best match for you." সাথে গ্যারান্টি: **"Tutor you'll love. Guaranteed. Try another tutor for free if you're not satisfied."**

**আমাদের গ্যাপ:** `teacher_profiles`-এ `trial_available` ও `trial_price` কলাম **ইতিমধ্যেই আছে** (migration 0019 পর্যন্ত), কিন্তু —
- শিক্ষক কার্ডে ব্যাজ দেখায় না
- `/teachers`-এ "শুধু ফ্রি ডেমো" ফিল্টার নেই
- হোমপেজে বা `/how-it-works`-এ ফানেলের ধাপ হিসেবে নেই

**করণীয়:** কলাম আছে বলে এটা **সস্তা জয়** —
- `teacher-card.tsx`-এ "ফ্রি ডেমো" / "ট্রায়াল ৳X" ব্যাজ
- `teacher-filters.tsx`-এ `trial=1` চেকবক্স
- `/how-it-works` + হোমের `HowItWorksDeck`-এ ৩-ধাপ: **প্রয়োজন জানান → ফ্রি ডেমো → শেখা শুরু**
- "পছন্দ না হলে আরেকজন শিক্ষক ফ্রি" — এই গ্যারান্টি ব্যানার (নীতিগত সিদ্ধান্ত তোমার)

**DB:** লাগবে না ✅

**প্রভাব:** 🔴 উচ্চ · **খাটুনি:** কম (আধা দিন)

---

### 2.4 হোমপেজে লাইভ টিউশন জব ফিড

**কে করছে:** Tuition Media হোমে ৩টা সাম্প্রতিক জব কার্ড + "580 new tuition posts in the last 24 hours"।

**আমাদের গ্যাপ:** `src/app/page.tsx`-এ `feed.tuitions` **সবসময় খালি অ্যারে** (`tuitions: []` হার্ডকোড করা)। মানে ইনফ্রাস্ট্রাকচার আছে, শুধু ব্যবহার হচ্ছে না।

**করণীয়:** §2.2-এর `public_tuitions()` RPC হয়ে গেলে হোমে ৩–৬টা সাম্প্রতিক টিউশন কার্ড + "গত ২৪ ঘণ্টায় X টি নতুন টিউশন" ব্যাজ।

**প্রভাব:** 🔴 উচ্চ · **খাটুনি:** কম (§2.2-এর পরে ২ ঘণ্টা)

---

## ৩. 🟠 P1 — Trust ও Growth (কোড হালকা, প্রভাব বেশি)

### 3.1 "আমরা যেখানে প্রকাশিত" / Press strip

**কে করছে:** Tuition Terminal — Prothom Alo, Samakal, Daily Star, Ittefaq, Champs24 লোগো স্ক্রল করে।

**আমাদের গ্যাপ:** কোনো external credibility signal নেই। বাংলাদেশি ইউজারের কাছে এটা **বিশাল trust factor**।

**করণীয়:** `src/config/site.ts`-এ `pressMentions[]` অ্যারে + হোমে marquee (আমাদের `motion-marquee` CSS ইতিমধ্যে আছে)।
⚠️ **সততা জরুরি:** আসল কভারেজ না থাকলে ভুয়া লোগো দেবে না। বিকল্প: "FS Coaching-এর উদ্যোগ" + "সুনামগঞ্জ ও সিলেটে সক্রিয়" + পার্টনার কোচিং সেন্টারের লোগো।

**প্রভাব:** 🟠 মাঝারি–উচ্চ · **খাটুনি:** কম (২ ঘণ্টা)

---

### 3.2 অ্যাপ ডাউনলোড সেকশন + QR কোড

**কে করছে:** Tuition Terminal — QR কোড, Google Play badge, App Store badge (আসলে PWA লিংক), ফোন mockup।

**আমাদের গ্যাপ:** আমাদের **PWA পুরোপুরি কাজ করে** (`manifest.ts`, `sw.js`, `offline.html`, service worker register) — কিন্তু ইউজার জানেই না! কোথাও "অ্যাপ ইনস্টল করুন" বলা নেই।

**করণীয়:**
- `/app` পেজ: QR কোড (build-time generated SVG), Android/iOS ইনস্টল instruction
- `beforeinstallprompt` ধরে custom "হোমস্ক্রিনে যোগ করুন" বাটন
- ফুটারে ব্যাজ, হোমে একটা সেকশন
- manifest-এ `screenshots[]` যোগ করলে Chrome রিচ install UI দেখায়

**DB:** লাগবে না ✅

**প্রভাব:** 🟠 মাঝারি–উচ্চ (retention) · **খাটুনি:** কম–মাঝারি (১ দিন)

---

### 3.3 হটলাইন / ফোন / WhatsApp / সোশ্যাল — ফুটারে

**কে করছে:** Tuition Terminal ফুটার — `info@tuitionterminal.com.bd`, **Call Hotline: 09678-444477**, পূর্ণ ঠিকানা, ৭টা সোশ্যাল আইকন (FB, IG, WhatsApp, YouTube, LinkedIn, Twitter, Pinterest)।

**আমাদের গ্যাপ:** আমাদের ফুটার/`/contact`-এ **শুধু একটা ইমেইল** (`hello@porasathi.com`)। বাংলাদেশে ফোন/WhatsApp ছাড়া অভিভাবক বিশ্বাস করেন না। `premiumConfig`-এ WhatsApp নম্বর আছে (`01626224878`) কিন্তু শুধু `/premium` পেজে।

**করণীয়:**
- `siteConfig`-এ `hotline`, `whatsapp`, `socials{}`, `address` যোগ
- ফুটারে যোগাযোগ কলাম + সোশ্যাল আইকন সারি
- `/contact` পেজ সমৃদ্ধ করা: ফোন, WhatsApp, সময়সূচি ("শনি–বৃহস্পতি, সকাল ৯টা–রাত ৯টা")
- মোবাইলে floating WhatsApp বাটন (bottom-nav-এর সাথে overlap না করে)
- `Organization` JSON-LD-তে `contactPoint` + `sameAs[]`

**প্রভাব:** 🟠 উচ্চ · **খাটুনি:** কম (৩–৪ ঘণ্টা)

---

### 3.4 অ্যাফিলিয়েট / আয়ের প্রোগ্রাম পেজ

**কে করছে:** Tuition Terminal — "Affiliate Program is a fantastic method for extra earnings. Everyone is eligible — housewives, students, & employees."

**আমাদের গ্যাপ:** `referrals` টেবিল + `/dashboard/referrals` **ইতিমধ্যেই আছে**, কিন্তু:
- কোনো পাবলিক মার্কেটিং পেজ নেই
- কোনো কমিশন/রিওয়ার্ড স্ট্রাকচার নেই
- লগইন না করলে জানার উপায় নেই

**করণীয়:** `/affiliate` পাবলিক পেজ — কীভাবে কাজ করে, কারা যোগ দিতে পারেন, কত আয়, লিডারবোর্ড। বিদ্যমান referral ইঞ্জিনের উপরেই বসবে।
- ঐচ্ছিক: `referral_rewards` টেবিল (payout tracking) — তখন `0034_referral_rewards.sql`

**প্রভাব:** 🟠 মাঝারি (viral growth) · **খাটুনি:** কম (পেজ) / মাঝারি (payout সহ)

---

### 3.5 পেমেন্ট পদ্ধতি ব্যাজ (bKash / Nagad / Rocket)

**কে করছে:** Tuition Terminal — "We Accept:" + bKash লোগো + সরাসরি bKash payment link।

**আমাদের গ্যাপ:** `/premium`-এ শুধু "WhatsApp করুন" — কোনো পেমেন্ট signal নেই। ইউজার বুঝতে পারেন না টাকা কীভাবে দেবেন।

**করণীয়:** ফুটার + `/premium`-এ bKash/Nagad ব্যাজ, bKash merchant/payment link (থাকলে)।
⚠️ README ঠিকই বলে: কোনো card/PIN/credential DB-তে রাখা যাবে না — শুধু external link।

**প্রভাব:** 🟠 মাঝারি · **খাটুনি:** খুব কম (১ ঘণ্টা)

---

### 3.6 ভিডিও টেস্টিমোনিয়াল

**কে করছে:** Tuition Terminal — YouTube-লিংক করা অভিভাবক থাম্বনেইল ("Real Happy Parents, Real Stories") + শিক্ষক গল্প।

**আমাদের গ্যাপ:** আমাদের `ReviewSpotlight` টেক্সট-only, আর সেটা DB-নির্ভর (এখন প্রায় খালি)।

**করণীয়:** `reviews`/testimonial-এ ঐচ্ছিক `video_url` + অভিভাবক/শিক্ষক আলাদা ট্যাব। কনটেন্ট না থাকলে সেকশন hide (আমাদের বর্তমান প্যাটার্নের মতোই)।

**প্রভাব:** 🟡 মাঝারি · **খাটুনি:** মাঝারি (কনটেন্ট জোগাড়ই আসল কাজ)

---

## ৪. 🟡 P2 — Monetization ও Marketplace গভীরতা

### 4.1 Tutor Gigs / প্যাকেজ (fixed-price অফার)

**কে করছে:** Tuition Media — `tutor_gigs.php`, "Math Crash", "IELTS Prep", ৳৫০০/hr — শিক্ষক নিজেই প্যাকেজ বানান।

**আমাদের গ্যাপ:** আমাদের মডেল সম্পূর্ণ "টিউশন পোস্ট → আবেদন"। শিক্ষক নিজে থেকে কিছু **অফার** করতে পারেন না। এটা Fiverr-স্টাইল সরবরাহ-চালিত রেভিনিউ চ্যানেল খুলে দেয়।

**করণীয়:** `/gigs` — শিক্ষক তৈরি করেন: শিরোনাম, বিবরণ, ক্লাস/বিষয়, ডেলিভারি মোড, সময়কাল, দাম। `/gigs/[id]` পাবলিক + `Product`/`Service` JSON-LD।

**DB:** `0035_tutor_gigs.sql` — `tutor_gigs` টেবিল + RLS (owner write, public read on published) + moderation flag

**প্রভাব:** 🟡 মাঝারি–উচ্চ · **খাটুনি:** বেশি (৩–৪ দিন)

---

### 4.2 Points / রিওয়ার্ড + মার্চ শপ

**কে করছে:** Tuition Media — "Use your Taka or earned Points to grab exclusive T-Shirts, Mugs" (`shop.php`)।

**আমাদের গ্যাপ:** কোনো gamification নেই (leaderboard ছাড়া)।

**করণীয়:** কম অগ্রাধিকার — প্রথমে core funnel ঠিক করা দরকার। ভবিষ্যতে: প্রোফাইল সম্পূর্ণতা / রিভিউ / রেফারেলে পয়েন্ট → Premium দিনে রিডিম (ফিজিক্যাল মার্চ নয়, তাতে logistics ঝামেলা)।

**প্রভাব:** 🟢 কম · **খাটুনি:** বেশি

---

### 4.3 এসক্রো / নিরাপদ পেমেন্ট
**কে করছে:** Tuition Media — "Secure Escrow Network", "Success Rate: 98.4%"।
**আমাদের অবস্থা:** ইচ্ছাকৃতভাবে নেই — payment এখনো Phase 5 (README অনুযায়ী)।
**সুপারিশ:** এখনই নয়। কিন্তু "নিরাপদ লেনদেনের নির্দেশিকা" পেজ (`/safety`-এর অংশ) দিয়ে trust gap পূরণ করা যায় — প্রথম মাসের ফি কীভাবে দেবেন, কী করবেন না ইত্যাদি।

### 4.4 Careers / টিম পেজ
**কে করছে:** Tuition Media (`careers.php`), Tuition Terminal (`/team`)।
**আমাদের গ্যাপ:** `/about` আছে, কিন্তু টিম বা নিয়োগ নেই। `developer.ts` config আছে — একই প্যাটার্নে `team.ts` বানানো সহজ।
**প্রভাব:** 🟢 কম · **খাটুনি:** কম

---

## ৫. 🔵 SEO গ্যাপ (Eudika-র সবচেয়ে বড় অস্ত্র)

Eudika-র হোমপেজে **২৪টি keyword-rich internal link** একটা স্ক্রলিং স্ট্রিপে — প্রতিটা আলাদা landing page:

```
/buet-home-tutor-in-dhaka          /dhaka-medical-college-tutors-in-bangladesh
/dhaka-university-home-teacher...  /english-medium-tutors-in-bangladesh
/ielts-tutor-in-bangladesh         /a-level-tutors-in-dhaka
/tutor-for-hsc-student-in-dhaka    /spoken-english-tutors-in-dhaka
```

**আমাদের অবস্থা:**

| ধরন | Eudika | PoraSathi |
|---|---|---|
| বিষয়ভিত্তিক পেজ | ~২০ | ২১ (`/subjects/[slug]`) ✅ |
| **জেলা × বিষয় combo** | অনেক | ❌ **নেই** |
| **প্রতিষ্ঠানভিত্তিক** (BUET/DU/Medical টিউটর) | ✅ | ❌ **নেই** |
| **পরীক্ষাভিত্তিক** (IELTS, SSC, HSC, Admission) | ✅ | ❌ **নেই** |
| **মাধ্যমভিত্তিক** (English Medium, O/A Level, মাদ্রাসা) | ✅ | ❌ **নেই** |
| জেলা পেজ | অনেক | **মাত্র ২টি** (সুনামগঞ্জ, সিলেট) |

**করণীয়:**
1. **`SUBJECT_LANDINGS` প্যাটার্ন কপি করে** নতুন landing generator: `EXAM_LANDINGS`, `MEDIUM_LANDINGS`, `INSTITUTION_LANDINGS` in `src/config/seo.ts`
2. `/teachers/[district]` — dynamic route, ৬৪ জেলার জন্য (বর্তমানে ২টা হার্ডকোডেড পেজ)
   - ⚠️ thin content এড়াতে: শুধু সেই জেলার পেজ index হবে যেখানে ≥N জন প্রকাশিত শিক্ষক আছেন
3. হোমপেজে keyword chip strip (Eudika-র মতো) — আমাদের `PopularMarquee` component **প্রায় প্রস্তুত**, শুধু SEO লিংক ফিড করতে হবে
4. প্রতিটা landing-এ ইউনিক FAQ (আমাদের `FaqList` + FAQPage JSON-LD ইতিমধ্যে আছে)

**DB:** লাগবে না (বিদ্যমান search RPC যথেষ্ট) ✅
**প্রভাব:** 🔴 উচ্চ (organic traffic) · **খাটুনি:** মাঝারি (২–৩ দিন)

---

## ৬. 🟣 ছোট UX জিনিস যা তিনটাতেই আছে, আমাদের নেই

| # | জিনিস | কোথায় দেখেছি | আমাদের অবস্থা |
|---|---|---|---|
| 1 | হোমে **বড় সার্চ বার** ("কোন বিষয়? কোন এলাকা?") | Eudika, TT | `QuickTeacherSearch` আছে কিন্তু hero-তে prominent নয় |
| 2 | **আইকনসহ ক্যাটাগরি গ্রিড** (Math/Physics/English কার্ড + টিউটর সংখ্যা) | Eudika ("Our Pro Tutors"), TT | ❌ শুধু টেক্সট chip |
| 3 | **অ্যানিমেটেড কাউন্টার** (0 থেকে গুনে ওঠা) | TT | ✅ `CountUp` আছে — ব্যবহৃত হচ্ছে |
| 4 | **শিক্ষকের প্রতিষ্ঠান ব্যাজ** (DU, BUET, Medical) | Eudika, TM | ⚠️ `institution` কলাম আছে, কার্ডে ব্যাজ নেই |
| 5 | **"X জন শিক্ষার্থী পড়িয়েছেন / Y ক্লাস"** স্ট্যাট | TM | ❌ নেই |
| 6 | **অনলাইন/উপলব্ধ ইন্ডিকেটর** ("1.2k+ Tutors Online") | TM | ❌ নেই |
| 7 | **আলাদা দুই ফানেল** — অভিভাবকের ধাপ vs শিক্ষকের ধাপ | TT (দুটো আলাদা সেকশন) | ⚠️ `/how-it-works` একটাই |
| 8 | **প্রোফাইল সম্পূর্ণতা টার্গেট** ("৮০% করলে দ্রুত সাড়া") | TT | ✅ `ProfileCompletion` আছে — copy-তে "কেন" যোগ করা যায় |
| 9 | **সাফল্যের হার** ব্যাজ | TM (98.4%) | ❌ নেই (সৎভাবে দেখাতে ডেটা লাগবে) |
| 10 | **নতুন/ফিচার্ড ব্যাজ** টিউশন কার্ডে | TM | ⚠️ `is_featured` কলাম আছে, "New" ব্যাজ নেই |

---

## ৭. প্রস্তাবিত রোডম্যাপ

### ধাপ ১ — "Conversion Sprint" (~১ সপ্তাহ) 🔴
> লক্ষ্য: ভিজিটর → লিড, আর শিক্ষক → রেজিস্ট্রেশন

1. `/hire-tutor` পাবলিক লিড ফর্ম + `/admin/leads` — §2.1
2. `/tuitions` আংশিক পাবলিক + JobPosting JSON-LD — §2.2
3. হোমে লাইভ টিউশন ফিড — §2.4
4. ফ্রি ডেমো ব্যাজ + ফিল্টার + ৩-ধাপ ফানেল — §2.3

**Migration:** `0032_public_tutor_leads.sql`, `0033_public_tuition_listing.sql`

### ধাপ ২ — "Trust Sprint" (~৩ দিন) 🟠
5. ফুটার যোগাযোগ: হটলাইন, WhatsApp, সোশ্যাল, ঠিকানা — §3.3
6. `/app` PWA ইনস্টল পেজ + QR + install prompt — §3.2
7. `/affiliate` পাবলিক পেজ — §3.4
8. পেমেন্ট ব্যাজ — §3.5
9. Trust/press strip (সৎ কনটেন্ট দিয়ে) — §3.1

**Migration:** লাগবে না

### ধাপ ৩ — "SEO Sprint" (~৩ দিন) 🔵
10. Exam / Medium / Institution landing generators — §5
11. `/teachers/[district]` dynamic (threshold-gated) — §5
12. হোমে keyword chip strip — §5
13. ক্যাটাগরি আইকন গ্রিড + প্রতিষ্ঠান ব্যাজ — §6.2, §6.4

**Migration:** লাগবে না

### ধাপ ৪ — "Marketplace Sprint" (~১ সপ্তাহ) 🟡
14. Tutor Gigs — §4.1 (`0035_tutor_gigs.sql`)
15. Careers / Team পেজ — §4.4
16. ভিডিও টেস্টিমোনিয়াল — §3.6

---

## ৮. এক নজরে অগ্রাধিকার ম্যাট্রিক্স

| ফিচার | প্রভাব | খাটুনি | DB? | অগ্রাধিকার |
|---|---|---|---|---|
| পাবলিক লিড ফর্ম (`/hire-tutor`) | 🔴🔴🔴 | মাঝারি | ✅ 0032 | **১** |
| `/tuitions` পাবলিক করা | 🔴🔴🔴 | মাঝারি | ✅ 0033 | **২** |
| ফ্রি ডেমো ব্যাজ + ফিল্টার | 🔴🔴 | **কম** | ❌ | **৩** ⚡ সস্তা জয় |
| হোমে টিউশন ফিড | 🔴🔴 | কম | (0033) | **৪** |
| SEO landing expansion | 🔴🔴 | মাঝারি | ❌ | **৫** |
| ফুটার হটলাইন + সোশ্যাল | 🟠🟠 | **কম** | ❌ | **৬** ⚡ সস্তা জয় |
| PWA `/app` পেজ + QR | 🟠🟠 | কম | ❌ | **৭** |
| `/affiliate` পেজ | 🟠 | কম | ❌ | **৮** |
| পেমেন্ট ব্যাজ | 🟠 | **খুব কম** | ❌ | **৯** ⚡ সস্তা জয় |
| Press/trust strip | 🟠 | কম | ❌ | **১০** |
| ক্যাটাগরি আইকন গ্রিড | 🟡 | কম | ❌ | ১১ |
| প্রতিষ্ঠান ব্যাজ (DU/BUET) | 🟡 | কম | ❌ | ১২ |
| Tutor Gigs | 🟡🟡 | **বেশি** | ✅ 0035 | ১৩ |
| ভিডিও টেস্টিমোনিয়াল | 🟡 | মাঝারি | ✅ | ১৪ |
| Careers / Team | 🟢 | কম | ❌ | ১৫ |
| Points / Merch shop | 🟢 | বেশি | ✅ | ১৬ |
| এসক্রো পেমেন্ট | 🟢 | খুব বেশি | ✅ | পরে |

---

## ৯. যা **কপি করা উচিত নয়**

সৎ থাকা দরকার — এই জিনিসগুলো প্রতিযোগীরা করে কিন্তু আমাদের করা ঠিক হবে না:

| জিনিস | কেন নয় |
|---|---|
| ভুয়া/inflated সংখ্যা ("39.6K tutors", "1.2k Online") | আমাদের `site_stats()` আসল DB count দেয় — এটাই আমাদের integrity। ছোট সংখ্যা লজ্জার নয়। |
| একই টেস্টিমোনিয়াল ৬ বার রিপিট (TT ও Eudika দুটোতেই) | দৃশ্যত ভরাট লাগে, কিন্তু ধরা পড়লে বিশ্বাস শেষ |
| "Better than others" ব্যাজ (TT) | অর্থহীন claim |
| Deprecated PHP error লিক (TM-এর হোমপেজেই দৃশ্যমান!) | আমাদের error boundary ইতিমধ্যে ঠিক আছে — বজায় রাখো |
| "98.4% Success Rate" ডেটা ছাড়া | মাপার ব্যবস্থা না থাকলে দাবি নয় |
| App Store badge যা আসলে PWA লিংক (TT) | বিভ্রান্তিকর — আমরা সৎভাবে "হোমস্ক্রিনে যোগ করুন" বলব |

---

## ১০. পরের ধাপ

তুমি বললে আমি **ধাপ ১ (Conversion Sprint)** থেকে শুরু করব — সাথে `0032` ও `0033` migration ফাইল। Migration গুলো তুমি `supabase db push` দিয়ে চালাবে (আমি sandbox থেকে তোমার DB-তে পৌঁছাতে পারি না)।

অথবা দ্রুত কিছু দেখতে চাইলে **⚡ সস্তা জয়** তিনটা (§2.3 ফ্রি ডেমো ব্যাজ, §3.3 ফুটার যোগাযোগ, §3.5 পেমেন্ট ব্যাজ) — DB ছাড়াই এক দিনে হয়ে যাবে।
