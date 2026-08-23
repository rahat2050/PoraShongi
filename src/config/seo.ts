import { CLASS_LEVELS, DISTRICTS, SUBJECTS } from "@/config/options";
import { getSiteUrl, siteConfig } from "@/config/site";

export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${siteConfig.brandName} — ${siteConfig.tagline}`,
} as const;

export const INDEX_FOLLOW = { index: true, follow: true } as const;
export const NOINDEX_FOLLOW = { index: false, follow: true } as const;
export const NOINDEX_NOFOLLOW = { index: false, follow: false, nocache: true } as const;

/** Launch-market location landings with unique, useful public pages. */
export const FEATURED_LOCATIONS = [
  {
    name: "Sunamganj",
    nameBn: "সুনামগঞ্জ",
    possessiveBn: "সুনামগঞ্জের",
    slug: "sunamganj",
    path: "/teachers/sunamganj",
    division: "Sylhet",
    blurb:
      "সুনামগঞ্জের শিক্ষার্থী ও অভিভাবক PoraSathi-তে প্রকাশিত প্রাইভেট শিক্ষক, হোম টিউটর ও অনলাইন শিক্ষক খুঁজতে পারেন।",
  },
  {
    name: "Sylhet",
    nameBn: "সিলেট",
    possessiveBn: "সিলেটের",
    slug: "sylhet",
    path: "/teachers/sylhet",
    division: "Sylhet",
    blurb:
      "সিলেট শহর ও আশপাশের এলাকায় ক্লাস, বিষয় ও মাধ্যম অনুযায়ী প্রকাশিত শিক্ষক প্রোফাইল দেখুন।",
  },
] as const;

export type FeaturedLocation = (typeof FEATURED_LOCATIONS)[number];

const INDEXABLE_SUBJECTS = SUBJECTS.filter((subject) => subject !== "Other");

export function toSeoSlug(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export const SUBJECT_LANDINGS = INDEXABLE_SUBJECTS.map((name) => ({
  name,
  slug: toSeoSlug(name),
  path: `/subjects/${toSeoSlug(name)}`,
}));

export type SubjectLanding = (typeof SUBJECT_LANDINGS)[number];

const featuredBySlug = new Map<string, FeaturedLocation>(FEATURED_LOCATIONS.map((item) => [item.slug, item]));
const featuredByName = new Map<string, FeaturedLocation>(FEATURED_LOCATIONS.map((item) => [item.name.toLowerCase(), item]));
const subjectBySlug = new Map<string, SubjectLanding>(SUBJECT_LANDINGS.map((item) => [item.slug, item]));
const subjectByName = new Map<string, SubjectLanding>(SUBJECT_LANDINGS.map((item) => [item.name.toLowerCase(), item]));

export function getFeaturedLocationBySlug(slug: string): FeaturedLocation | undefined {
  return featuredBySlug.get(toSeoSlug(slug));
}

export function getFeaturedLocationByName(name: string): FeaturedLocation | undefined {
  return featuredByName.get(name.trim().toLowerCase());
}

export function getSubjectLandingBySlug(slug: string): SubjectLanding | undefined {
  return subjectBySlug.get(toSeoSlug(slug));
}

export function getSubjectLandingByName(name: string): SubjectLanding | undefined {
  return subjectBySlug.get(toSeoSlug(name)) ?? subjectByName.get(name.trim().toLowerCase());
}

export function isKnownDistrict(name: string): boolean {
  return (DISTRICTS as readonly string[]).includes(name);
}

export function isKnownClassLevel(name: string): boolean {
  return (CLASS_LEVELS as readonly string[]).includes(name);
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl().replace(/\/+$/, "");
  if (!path || path === "/") return `${base}/`;
  return path.startsWith("http://") || path.startsWith("https://")
    ? path
    : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function teacherProfilePath(id: string): string {
  return `/teachers/${id}`;
}

export function locationPathForDistrict(district?: string | null): string | null {
  if (!district) return null;
  return getFeaturedLocationByName(district)?.path ?? null;
}

export function subjectPathForName(subject?: string | null): string | null {
  if (!subject) return null;
  return getSubjectLandingByName(subject)?.path ?? null;
}

export function teacherDisplayName(
  teacher: { display_name?: string | null; full_name?: string | null },
): string {
  return teacher.display_name?.trim() || teacher.full_name?.trim() || "শিক্ষক";
}

export function teacherLocationLabel(teacher: {
  area?: string | null;
  district?: string | null;
  teaching_mode?: string | null;
}): string {
  const place = [teacher.area, teacher.district].filter(Boolean).join(", ");
  if (place) return place;
  if (teacher.teaching_mode === "online" || teacher.teaching_mode === "both") return "অনলাইন";
  return "";
}

export function truncateMeta(value: string, max = 160): string {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export const PRIVATE_ROBOTS_PATHS = [
  "/admin/",
  "/dashboard/",
  "/messages/",
  "/account",
  "/account/",
  "/profile",
  "/profile/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth/",
  "/api/",
  "/demo",
  "/blog/new",
] as const;
