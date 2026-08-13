/**
 * Central site / brand configuration.
 * Single source of truth for PoraShongi branding across the app.
 */
export const siteConfig = {
  name: "PoraShongi",
  brandName: "PoraShongi",
  brandNameBangla: "পড়াসঙ্গী",
  tagline: "পড়াশোনার সঠিক সঙ্গী",
  taglineEnglish: "The Right Companion for Your Studies",
  description:
    "PoraShongi (পড়াসঙ্গী) is a Bangladesh-focused teacher–student tuition marketplace that connects students, guardians and qualified teachers.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "bn-BD",
  region: "Sunamganj / Sylhet, Bangladesh",
  links: {
    github: "https://github.com/rahat2050/PoraShongi",
  },
} as const;

export type SiteConfig = typeof siteConfig;
