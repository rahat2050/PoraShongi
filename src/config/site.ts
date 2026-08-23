/**
 * PoraSathi (পড়াসাথী) — central site/brand configuration.
 * A platform by FS Coaching.
 */

const PRODUCTION_SITE_URL = "https://porasathi.rahatahmed.site";

/**
 * Return one normalized origin for metadata, sitemaps and public share links.
 * A production build must never leak a localhost URL when the deployment
 * variable is missing or accidentally copied from local development.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configured) {
    try {
      const url = new URL(configured);
      const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";

      if (process.env.NODE_ENV !== "production" || !isLocalhost) {
        return url.origin;
      }
    } catch {
      // Fall through to the safe environment-specific default below.
    }
  }

  return process.env.NODE_ENV === "development" ? "http://localhost:3000" : PRODUCTION_SITE_URL;
}

export const siteConfig = {
  name: "PoraSathi",
  brandName: "PoraSathi",
  brandNameBangla: "পড়াসাথী",
  tagline: "সঠিক শিক্ষক, সুন্দর শেখার সঙ্গী",
  taglineEnglish: "The Right Teacher, A Beautiful Learning Companion",
  branding: "A platform by FS Coaching",
  defaultTitle: "PoraSathi – Find Tutors & Tuition in Bangladesh | পড়াসাথী",
  description:
    "PoraSathi (পড়াসাথী) — বাংলাদেশে প্রাইভেট শিক্ষক ও হোম টিউশন খুঁজুন। সুনামগঞ্জ ও সিলেট থেকে শুরু করে শিক্ষার্থী, অভিভাবক এবং যোগ্য শিক্ষককে নিরাপদে যুক্ত করে।",
  /** সাইটের উপরে ছোট ঘোষণা — খালি রাখলে দেখাবে না। */
  announcement: null as { text: string; href?: string } | null,
  url: getSiteUrl(),
  locale: "bn-BD",
  contactEmail: "hello@porasathi.com",
} as const;

export type SiteConfig = typeof siteConfig;
