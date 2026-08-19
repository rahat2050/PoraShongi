# PoraSathi (পড়াসাথী) — Full Project Analysis & Bug Report

**Date:** 2026-08-19 · **Branch:** arena/01a01972-porashongi · **Commit analyzed:** 1801fd2

---

## 1. What was verified (সব ঠিক আছে)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ 0 errors |
| `npx eslint .` | ✅ 0 errors |
| `npm run build` (Next.js 16.3, Turbopack) | ✅ build succeeds, 60+ routes |
| `npx playwright test` (e2e: a11y, SEO, security headers, auth redirects, mobile nav) | ✅ all pass (20 tests) |
| Runtime smoke test — 25 routes | ✅ no 5xx, guards redirect correctly |
| RLS/trigger review — all 30 migrations (0000–0029) | ✅ (bugs found below were fixed in 0030) |

**Strong points:** role-change protection triggers, message immutability trigger (0017), batch seat locking (`for update`), request status state machine, safe `next` redirects, origin checks on API routes, admin actions all `requireAdmin()`-guarded, minor-student area hiding, 48h message retention.

---

## 2. Bugs found — status: ✅ ALL FIXED in `0030_security_hardening.sql` + app changes

### 🔴 P1 — Meeting link যেকোনো logged-in user দেখতে পারে (`search_tuitions` + RLS) ✅ FIXED
- **Fix:** `search_tuitions` আর `meeting_link` return করে না; `tuitions` টেবিল থেকে `authenticated` role-এর column-level select grant-এ `meeting_link` বাদ দেওয়া হয়েছে (শুধু guarded `get_public_tuition` RPC দিয়ে owner/student/accepted teacher/admin-ই পায়)।
- App-এর সব direct `tuitions` select explicit column list-এ আনা হয়েছে (`getTuitionById`, `adminListTuitions`, export route, `listTuitionsFor`, `listSavedTuitions`)।

### 🔴 P1 — শিক্ষার্থীর (নাবালক) পরিচয় বের করার চেইন ✅ FIXED
- **Fix:** `get_public_tuition` এখন `student_id` শুধু owner/student/accepted teacher/admin-কে দেয়। `get_profiles_public` এখন relationship-aware: নাবালকের নাম/ছবি শুধু legitimately involved user-রা (কথোপকথনের অংশীদার, অনুরোধ/যোগাযোগ/trial sender, linked guardian, tuition owner) দেখতে পায় — নতুন `can_view_profile_identity()` helper দিয়ে। `search_tuitions`-এ নাবালক poster-এর নাম/ছবিও mask করা হয়েছে।

### 🟠 P2 — Reviewer নিজের লুকানো রিভিউ নিজেই আবার প্রকাশ করতে পারে (REST) ✅ FIXED
- **Fix:** নতুন `reviews_validate_update` BEFORE UPDATE trigger — non-admin শুধু নিজের published review-এর `rating`/`body`/`tuition_id` বদলাতে পারে; `status`, `verified`, `teacher_id`, `reviewer_id`, `created_at` immutable (0017-এর message trigger-এর প্যাটার্নে)।

### 🟠 P2 — `admin_analytics()` RPC-তে কোনো auth guard নেই ✅ FIXED
- **Fix:** এখন active admin/super admin ছাড়া raise exception (0020/0029-এর মতো)।

### 🟠 P2 — District filter no-op bug (deployment trap) ✅ (0013-তে আগেই fixed)
- **Production-এ যাচাই করুন** যে `0013_location_search.sql` (এবং 0016, 0025, 0030) applied আছে — README-তে প্রয়োগের তালিকা হালনাগাদ করা হয়েছে।

### 🟠 P2 — প্রতি message insert-এ পুরো messages টেবিলে retention DELETE ✅ FIXED
- **Fix:** insert-trigger এখন শুধু ওই conversation-এর পুরনো বার্তাই prune করে (bounded); hourly pg_cron sweep আগের মতোই আছে।

### 🟡 P3 — Tuition state machine শুধু app-স্তরে ✅ FIXED
- **Fix:** নতুন `tuitions_validate_update` BEFORE UPDATE trigger — poster/student_id immutable, status transition matrix (open/paused/assigned/completed/closed) server-side enforced, `assigned` শুধু accepted request দিয়ে (0017-এর notify trigger-এর সাথে সামঞ্জস্যপূর্ণ), meeting link শুধু owner/accepted teacher সেট করতে পারে।

### 🟡 P3 — `startConversation` / `sendMessage`-এ spam protection নেই ✅ FIXED
- **Fix:** নতুন trigger — প্রতি ৬০ সেকেন্ডে সর্বোচ্চ ৩০টি message, প্রতি ৬০ মিনিটে সর্বোচ্চ ২০টি নতুন conversation (direct REST-ও covered)।

### 🟡 P3 — `/api/session` POST-এ malformed Origin → 500 ✅ FIXED
- **Fix:** safe origin parse (analytics route-এর মতো) — malformed/cross-origin → 403। Regression test যোগ করা হয়েছে।

### 🟡 P3 — `record_profile_view` bot/anon-এ বাড়ে ✅ FIXED
- **Fix:** RPC এখন anon-এ কাজ করে না (revoke), নিজের ভিউ count হয় না; app-ও শুধু logged-in visitor-এ কল করে।

### 🟢 P4 — ছোটখাটো ✅ FIXED
- `updateNotificationPreferences`-এ `updated_at` এখন set হয়।
- `tuitionSchema.budget` / `experienceYears` / `expectedSalary` / student `budget` — invalid input এখন error দেখায় (silent null নয়)।
- `features-actions-ui.tsx` ও `features-actions-ui2.tsx` ডুপ্লিকেট merge করা হয়েছে (`ui2` মুছে দেওয়া হয়েছে)।
- `sw.js` — `CACHE_NAME` → `porasathi-v2`, `_next/static` এখন **network-first** (stale assets আর আটকে থাকবে না)।
- CSP-তে `script-src 'unsafe-inline'` — JSON-LD/theme script-এর জন্য nonce আনা সম্ভব; বড় রিফ্যাক্টর, ঝুঁকি কম — পরবর্তী ধাপ হিসেবে রাখা হয়েছে।
- `is_minor`/`guardian_consent` self-declared — KYC ছাড়া সম্পূর্ণ ঠিক করা সম্ভব নয় (জানা জরুরি)।

---

## 3. Deployment checklist

1. **`supabase/migrations/0030_security_hardening.sql` apply করুন** (আগে backup)।
2. Production-এ 0013, 0016, 0025 আগে থেকে applied আছে কিনা যাচাই করুন।
3. App deploy করুন — নতুন migration ছাড়া meeting-link restriction active হবে না (শুধু RPC-স্তরের fix কাজ করবে)।
4. পুনরায় verify: `npm run typecheck && npm run lint && npm run build && npx playwright test`

## 4. Notes

- সব server action-ই `requireProfile`/`requireRole`/`requireAdmin` দিয়ে guarded — এগুলো শক্ত ছিল, অপরিবর্তিত।
- 0030-এর সব SQL আসল PostgreSQL parser (pglast) দিয়ে validated।
- `get_profiles_public`-এ নাবালক masking relationship-scoped — legit ব্যবহারকারীরা (conversation partner, request sender/teacher, linked guardian) আগের মতোই নাম দেখতে পাবেন।
