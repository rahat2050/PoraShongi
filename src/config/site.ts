/**
 * PoraSathi (পড়াসাথী) — central site/brand configuration.
 * A platform by FS Coaching.
 */
export const siteConfig = {
  name: "PoraSathi",
  brandName: "PoraSathi",
  brandNameBangla: "পড়াসাথী",
  tagline: "সঠিক শিক্ষক, সুন্দর শেখার সঙ্গী",
  taglineEnglish: "The Right Teacher, A Beautiful Learning Companion",
  branding: "A platform by FS Coaching",
  description:
    "PoraSathi (পড়াসাথী) — বাংলাদেশের শিক্ষার্থী/অভিভাবক এবং যোগ্য শিক্ষককে যুক্ত করার trusted প্ল্যাটফর্ম। শিক্ষক খুঁজুন, tuition দিন, schedule manage করুন।",
  /** সাইটের উপরে ছোট ঘোষণা — খালি রাখলে দেখাবে না। */
  announcement: null as { text: string; href?: string } | null,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "bn-BD",
} as const;

export type SiteConfig = typeof siteConfig;
