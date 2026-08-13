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
    "PoraSathi (পড়াসাথী) — বাংলাদেশের শিক্ষার্থী/অভিভাবক এবং যোগ্য শিক্ষককে একটি trusted digital platform-এর মাধ্যমে সহজে সংযুক্ত করে।",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "bn-BD",
} as const;

export type SiteConfig = typeof siteConfig;
