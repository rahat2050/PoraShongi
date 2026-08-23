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

/**
 * Public contact channels.
 *
 * বাংলাদেশে অভিভাবকরা ইমেইলের চেয়ে ফোন/WhatsApp বেশি বিশ্বাস করেন, তাই এগুলো
 * footer, /contact এবং Organization JSON-LD — সব জায়গায় একই উৎস থেকে আসে।
 * নম্বর বদলাতে হলে শুধু এখানে বদলান।
 */
export const contactConfig = {
  /** Display form used in UI text. */
  hotlineDisplay: "01626-224878",
  /** tel: link target (E.164 without +, Bangladesh). */
  hotlineE164: "8801626224878",
  whatsappDisplay: "01626-224878",
  whatsappE164: "8801626224878",
  whatsappGreeting: "আসসালামু আলাইকুম, আমি PoraSathi সম্পর্কে জানতে চাই।",
  email: "hello@porasathi.com",
  /** Support availability, shown next to the hotline. */
  hoursBn: "শনি–বৃহস্পতি · সকাল ৯টা – রাত ৯টা",
  addressBn: "সুনামগঞ্জ, সিলেট বিভাগ, বাংলাদেশ",
  addressLocality: "Sunamganj",
  addressRegion: "Sylhet",
  addressCountry: "BD",
} as const;

export function getHotlineTelUrl(): string {
  return `tel:+${contactConfig.hotlineE164}`;
}

export function getWhatsAppUrl(message: string = contactConfig.whatsappGreeting): string {
  return `https://wa.me/${contactConfig.whatsappE164}?text=${encodeURIComponent(message)}`;
}

/**
 * Social profiles. Only add a link that actually exists — an empty `href`
 * hides the icon everywhere instead of shipping a dead link.
 */
export const socialLinks = [
  { key: "facebook", label: "Facebook", href: "https://www.facebook.com/profile.php?id=61554888806166" },
  { key: "whatsapp", label: "WhatsApp", href: getWhatsAppUrl() },
  { key: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/rahat-ahmed-9b0a5b2a9/" },
  { key: "github", label: "GitHub", href: "https://github.com/rahat2050" },
] as const satisfies ReadonlyArray<{ key: string; label: string; href: string }>;

export type SocialLink = (typeof socialLinks)[number];

/**
 * Accepted payment channels for Premium.
 *
 * ⚠️ PoraSathi কোনো card/PIN/wallet credential সংরক্ষণ করে না — এগুলো শুধু
 * ইউজারকে জানানোর জন্য যে টাকা কীভাবে পাঠাবেন।
 */
export const paymentMethods = [
  { key: "bkash", label: "bKash", hint: "Send Money / Payment", tone: "#e2136e" },
  { key: "nagad", label: "Nagad", hint: "Send Money", tone: "#ec1c24" },
  { key: "rocket", label: "Rocket", hint: "Send Money", tone: "#8c3494" },
] as const;

export type PaymentMethod = (typeof paymentMethods)[number];

/**
 * Trust signals shown on the homepage.
 *
 * ⚠️ সততা নীতি: এখানে কখনো ভুয়া সংবাদমাধ্যমের লোগো বা বানানো সংখ্যা বসাবেন না।
 * প্রতিযোগীরা করে, আমরা করব না। শুধু যাচাইযোগ্য, সত্য তথ্য।
 */
export const trustSignals = [
  {
    key: "fs-coaching",
    title: "FS Coaching-এর উদ্যোগ",
    detail: "প্রতিষ্ঠিত কোচিং প্রতিষ্ঠানের সরাসরি তত্ত্বাবধানে পরিচালিত।",
  },
  {
    key: "verified-only",
    title: "যাচাইকৃত প্রোফাইল",
    detail: "ফোন, শিক্ষাগত যোগ্যতা ও পরিচয় — চার স্তরের ভেরিফিকেশন।",
  },
  {
    key: "real-stats",
    title: "আসল সংখ্যা, বানানো নয়",
    detail: "হোমপেজের প্রতিটি পরিসংখ্যান সরাসরি ডেটাবেস থেকে গণনা করা।",
  },
  {
    key: "privacy",
    title: "ডেটা আপনার নিয়ন্ত্রণে",
    detail: "যেকোনো সময় নিজের সব তথ্য ডাউনলোড বা অ্যাকাউন্ট মুছে ফেলতে পারবেন।",
  },
] as const;

export type TrustSignal = (typeof trustSignals)[number];
