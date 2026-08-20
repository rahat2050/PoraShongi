# Animation Audit — PoraSathi (পড়াসাথী)

> তারিখ: ২০২৬-০৮-২০ — কোর অডিট + নতুন অ্যানিমেশন যোগ করা হয়েছে।

## ১) এখন যা ইতিমধ্যে আছে (যা দেখলাম)

PoraSathi-তে ইতিমধ্যে বেশ শক্তিশালী, zero-dependency motion system আছে:

| অ্যানিমেশন | কোথায় | ফাইল |
|---|---|---|
| Page-enter fade | প্রতিটি page লোডে | `src/app/template.tsx` + `page-enter` keyframe |
| Hero entrance (copy + stage slide-up) | হোম hero | `hero-section.tsx` + `hero-copy-enter` / `hero-stage-enter` |
| Scroll progress bar (উপরে gradient bar) | সব পেজ | `src/components/motion/scroll-progress.tsx` |
| Pointer tilt 3D (মাউসে কার্ড কাত হয়) | Hero card, role cards, teacher cards | `src/components/motion/pointer-tilt.tsx` |
| Scroll-driven reveal / flip (CSS `animation-timeline`) | Home sections, teacher cards | `motion-reveal`, `motion-flip`, `motion-flip-up` in `globals.css` |
| Sticky 3D scroll-flip deck ("কীভাবে কাজ করে") | Home | `src/components/motion/scroll-flip-deck.tsx` |
| Scroll fan (৩টি role card পাখার মতো খোলে) | Home | `src/components/motion/scroll-fan.tsx` |
| 3D coverflow carousels (featured teachers, journey) | Home | `featured-coverflow.tsx`, `journey-coverflow.tsx` |
| Animated counter + digit-flip | Live stats | `live-stats-section.tsx` + `digit-flip` keyframe |
| Floating badges | Final CTA | `motion-float` |
| Card hover lift / glow | অনেক কার্ড | `motion-card`, `motion-glow`, `card-hover` |
| Skeleton shimmer | Loading states | `animate-shimmer` |
| Back-to-top fade/slide | সব পেজ | `back-to-top.tsx` |
| **Reduced-motion সম্পূর্ণ সম্মান** | Global | `reduced-motion.ts` + CSS `@media` block |

মজার বিষয়: এই codebase-এ কোনো animation library (Framer Motion/GSAP) নেই — সব হাতে লেখা, compositor-friendly।

## ২) এই অডিটে যা যা যোগ করলাম (implemented)

### a) `Reveal` — reusable scroll-reveal component (নতুন)
`src/components/motion/reveal.tsx` — IntersectionObserver-ভিত্তিক staggered entrance:
- দিক কাস্টমাইজ করা যায় (`up / down / left / right / none`) + `delay` prop (stagger-এর জন্য `index * 70`)
- `prefers-reduced-motion` থাকলে অ্যানিমেশন ছাড়াই দেখায়
- SSR/no-JS ব্যবহারকারীর জন্য কনটেন্ট সবসময় visible (hydration-এর পরে hide হয়)

**যেখানে লাগিয়েছি (stagger সহ):**
- `/teachers` grid — প্রতিটি teacher card ধাপে ধাপে উঠে আসে
- `/tuitions` grid — একই
- `/resources` grid — একই
- `/blog` list — একই
- `/leaderboard` rows — একই

### b) Popular subjects/classes infinite marquee (নতুন)
হোমের "এখন যা বেশি খোঁজা হচ্ছে" সেকশনে একটা ধীর infinite marquee ribbon — pure CSS (`marquee-scroll` keyframe), hover-এ pause হয়, reduced-motion-এ স্থির থাকে, mask-image দিয়ে দুই প্রান্ত fade।

### c) Hero gradient headline shimmer (নতুন)
`শেখার পথ সহজ করুন` gradient টেক্সটে ধীরে ধীরে রং বদলায় (7s loop) — `text-gradient-shimmer`।

### d) Toast entrance animation (নতুন)
Toast item-এ আগে থেকে থাকা `message-in` keyframe লাগালাম — toast এখন মসৃণভাবে ভেসে ওঠে।

### e) Theme toggle icon switch (নতুন)
Dark/light toggle-এ icon-টি rotate+scale হয়ে বদলায় (`theme-icon-switch` keyframe)।

## ২.৫) "সব professional কাজ করো" রাউন্ডে যা যা যোগ হলো (Implemented ✅)

নিচের সবগুলো reduced-motion-safe, no-JS-safe এবং কোনো external library ছাড়া:

1. **Smart header (hide-on-scroll + shadow)** — নিচে স্ক্রল করলে header সরে যায়, উপরে এলে ফিরে আসে; scroll-এ shadow গাঢ় হয়। `prefers-reduced-motion` বা keyboard focus-এ কখনো লুকায় না। (`header.tsx` → client)
2. **Button press feedback + shine sweep** — সব বাটনে `active:scale-[0.97]`; primary বাটনে hover-এ shine sweep (`btn-shine`)। (`button.tsx`)
3. **Nav animated polish** — desktop nav-এ hover lift + press + icon micro-zoom; dashboard nav-এ একই; mobile menu panel slide-in + প্রতিটি link staggered entrance। (`desktop-nav.tsx`, `mobile-nav.tsx`, `dashboard-nav.tsx`)
4. **Stat card count-up** — dashboard/admin এর সব numeric stat card viewport-এ এলে 0 → value count-up করে। (`stat-card.tsx` + নতুন `motion/count-up.tsx`)
5. **Tuition fee micro count-up** — টিউশন কার্ডের বাজেট সংখ্যা count-up হয়। (`tuition-card.tsx`)
6. **Profile completion animated bar** — প্রোফাইল সম্পূর্ণতা bar 0 → X% পর্যন্ত animate হয় + percent count-up। (`profile-completion.tsx` → client)
7. **Announcement bar entrance** — config থাকলে slide-down entrance। (`announcement.tsx`)
8. **Page transition উন্নত** — page-enter এখন হালকা slide+fade (300ms ease-out)। (`globals.css`)
9. **Avatar hover zoom** — teacher/তিউশন/coverflow কার্ডে avatar hover-এ gently zoom হয়। (`teacher-card`, `tuition-card`, `home-teacher-section`, `featured-coverflow`)
10. **Parallax gradient blobs** — hero, CTA, stats, coverflow সেকশনের decorative blob গুলো scroll-এ আলাদা গতিতে ভেসে চলে (progressive enhancement)। (`globals.css` + ৬ সেকশন)
11. **Chat bubble entrance** — ইতিমধ্যে ছিল (`animate-message-in`) ✅
12. **Stagger reveal আরও পেজে** — `/coaching`, dashboard favorites, saved-tuitions, messages list, requests, notifications tabs, tuition/teacher detail (top card + matches + similar), profile form cards, coaching detail। (`Reveal` component)
13. **Empty state icon float** — খালি স্টেটের icon মৃদু float করে। (`empty-state.tsx`)
14. **Back-to-top polish** — hover lift + press feedback। (`back-to-top.tsx`)
15. **Toast entrance** — আগের রাউন্ডে যোগ হয়েছে (message-in) ✅

**ছেড়ে দেওয়া হয়েছে (ইচ্ছাকৃত):** typing effect (a11y ঝুঁকি), full-page route overlay (SE/UX ঝুঁকি), video hero (performance), confetti burst (redirect-এ চোখে পড়ে না), auto-rotating testimonial (নির্ভরযোগ্য data নেই)।

## ৩) আরও যা যোগ করা যেতে পারে (menu — বাছাই করে বলুন, করে দেব)

| # | অ্যানিমেশন | কোথায় | Effort | Impact |
|---|---|---|---|---|
| 1 | Header hide-on-scroll (নিচে গেলে লুকায়, উপরে এলে দেখায়) + shadow | `header.tsx` | কম | উচ্চ |
| 2 | Nav link animated underline / pill | `desktop-nav.tsx`, `mobile-nav.tsx` | কম | মাঝারি |
| 3 | Primary CTA তে shine sweep / magnetic hover | `button.tsx` | কম | মাঝারি |
| 4 | Count-up numbers dashboard stat cards-এ | `stat-card.tsx` (dashboard) | কম | মাঝারি |
| 5 | Tuition fee/rating micro count-up | `tuition-card.tsx` | কম | মাঝারি |
| 6 | Profile completion bar animated fill | `profile-completion.tsx` | কম | মাঝারি |
| 7 | Announcement bar slide-in/out | `announcement.tsx` | কম | কম |
| 8 | Page route transition (slight slide+fade) | `template.tsx` | কম | মাঝারি |
| 9 | Image/avatar hover zoom + subtle parallax | teacher/coaching cards | কম | কম |
| 10 | Message chat bubble entrance (একটা keyframe আছে, chat-panel-এ লাগানো যায়) | `chat-panel.tsx` | কম | মাঝারি |
| 11 | Scroll-triggered progress ring (profile completeness %) | dashboard | মাঝারি | মাঝারি |
| 12 | Stagger reveal: coaching cards, tuitions detail, dashboard grids | আরও ৫-৬ পেজ | কম | মাঝারি |
| 13 | Auto-rotating testimonial/review spotlight | home/review section | মাঝারি | মাঝারি |
| 14 | Confetti/checkmark burst on signup/request success | auth/request forms | মাঝারি | কম |
| 15 | Video-loop style hero background (subtle) | hero | বেশি | মাঝারি |
| 16 | Parallax gradient blobs on scroll | home sections | মাঝারি | কম |
| 17 | Typing effect for hero tagline | hero | মাঝারি | কম (a11y ঝুঁকি) |
| 18 | Full-page transition overlay | app | বেশি | উচ্চ (কিন্তু ঝুঁকিপূর্ণ) |

**নোট:** ১৩–১৮ আরও জটিল/ঝুঁকিপূর্ণ; ১–১০ নিরাপদ ও দ্রুত। যেকোনোটা বেছে নিলে বলে দিন — implementation + test করে দেব। সব নতুন motion-এ `prefers-reduced-motion` সম্মান করা হবে (এই repo-র existing pattern অনুযায়ী)।
