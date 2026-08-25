import { CLASS_LEVELS, DISTRICTS, SUBJECTS } from "@/config/options";
import { DISTRICT_INFO, banglaPossessive } from "@/config/districts";
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

/**
 * ৬৪ জেলার ল্যান্ডিং পেজ। প্রতিটা `/teachers/<slug>` — `search_teachers(p_district)`
 * দিয়ে ফিল্টার করা, তাই আলাদা কোনো DB পরিবর্তন লাগে না। স্লাগ `/teachers/[id]`-এর
 * সাথে একই রুট শেয়ার করে; রুট রিজলভার `resolveDirectorySlug` দেখুন।
 */
export const DISTRICT_LANDINGS = DISTRICT_INFO.map((district) => ({
  name: district.name,
  nameBn: district.nameBn,
  division: district.division,
  possessiveBn: banglaPossessive(district.nameBn),
  slug: toSeoSlug(district.name),
  path: `/teachers/${toSeoSlug(district.name)}`,
}));

export type DistrictLanding = (typeof DISTRICT_LANDINGS)[number];

/**
 * পরীক্ষা/শ্রেণি-ভিত্তিক ল্যান্ডিং। `classLevel` সরাসরি `search_teachers(p_class)`-এ যায়,
 * তাই এগুলোও বিদ্যমান RPC দিয়েই চলে।
 */
export const EXAM_LANDINGS = [
  {
    name: "SSC",
    nameBn: "এসএসসি",
    classLevel: "SSC",
    slug: "ssc",
    path: "/exams/ssc",
    blurb:
      "এসএসসি পরীক্ষার্থীদের জন্য গণিত, পদার্থ, রসায়ন, জীববিজ্ঞান ও ইংরেজির প্রকাশিত শিক্ষক প্রোফাইল দেখুন।",
  },
  {
    name: "HSC",
    nameBn: "এইচএসসি",
    classLevel: "HSC",
    slug: "hsc",
    path: "/exams/hsc",
    blurb:
      "এইচএসসি পরীক্ষার্থীদের জন্য উচ্চতর গণিত, পদার্থ, রসায়ন, জীববিজ্ঞান, হিসাববিজ্ঞান ও ইংরেজির প্রকাশিত শিক্ষক দেখুন।",
  },
  {
    name: "Admission Test",
    nameBn: "ভর্তি পরীক্ষা",
    classLevel: "Admission Test",
    slug: "admission-test",
    path: "/exams/admission-test",
    blurb:
      "বিশ্ববিদ্যালয় ও মেডিকেল/ইঞ্জিনিয়ারিং ভর্তি প্রস্তুতির জন্য প্রকাশিত শিক্ষক প্রোফাইল — বিষয় ও অভিজ্ঞতা মিলিয়ে বেছে নিন।",
  },
  {
    name: "University",
    nameBn: "বিশ্ববিদ্যালয়",
    classLevel: "University",
    slug: "university",
    path: "/exams/university",
    blurb:
      "বিশ্ববিদ্যালয় পর্যায়ের কোর্সে সাহায্যের জন্য প্রকাশিত শিক্ষক — অনলাইনেও পড়ানো হয়।",
  },
  {
    name: "Class 10",
    nameBn: "দশম শ্রেণি",
    classLevel: "Class 10",
    slug: "class-10",
    path: "/exams/class-10",
    blurb:
      "দশম শ্রেণির পড়াশোনা ও বার্ষিক প্রস্তুতির জন্য প্রকাশিত শিক্ষক প্রোফাইল দেখুন।",
  },
  {
    name: "Class 8",
    nameBn: "অষ্টম শ্রেণি",
    classLevel: "Class 8",
    slug: "class-8",
    path: "/exams/class-8",
    blurb:
      "অষ্টম শ্রেণির শিক্ষার্থীদের জন্য গণিত, বিজ্ঞান ও ইংরেজির প্রকাশিত শিক্ষক প্রোফাইল।",
  },
  {
    name: "Class 5",
    nameBn: "পঞ্চম শ্রেণি",
    classLevel: "Class 5",
    slug: "class-5",
    path: "/exams/class-5",
    blurb:
      "পঞ্চম শ্রেণির শিক্ষার্থীদের জন্য প্রাথমিক গণিত, বিজ্ঞান, বাংলা ও ইংরেজির প্রকাশিত শিক্ষক।",
  },
] as const;

export type ExamLanding = (typeof EXAM_LANDINGS)[number];

/** হোমপেজের ট্রেন্ডিং স্ট্রিপ ও ফুটারে ব্যবহৃত সব SEO ল্যান্ডিং একসাথে। */
export type DirectoryLanding =
  | { kind: "district"; landing: DistrictLanding }
  | { kind: "exam"; landing: ExamLanding };

const featuredBySlug = new Map<string, FeaturedLocation>(FEATURED_LOCATIONS.map((item) => [item.slug, item]));
const featuredByName = new Map<string, FeaturedLocation>(FEATURED_LOCATIONS.map((item) => [item.name.toLowerCase(), item]));
const subjectBySlug = new Map<string, SubjectLanding>(SUBJECT_LANDINGS.map((item) => [item.slug, item]));
const subjectByName = new Map<string, SubjectLanding>(SUBJECT_LANDINGS.map((item) => [item.name.toLowerCase(), item]));

const examBySlug = new Map<string, ExamLanding>(EXAM_LANDINGS.map((item) => [item.slug, item]));
const districtBySlug = new Map<string, DistrictLanding>(DISTRICT_LANDINGS.map((item) => [item.slug, item]));
const districtByName = new Map<string, DistrictLanding>(
  DISTRICT_LANDINGS.map((item) => [item.name.toLowerCase(), item]),
);

/**
 * `/teachers/<slug>` একই রুটে শিক্ষক প্রোফাইল (UUID) ও জেলা ল্যান্ডিং দুটোই ধরে।
 * এই রিজলভার ঠিক করে দেয় কোনটা — UUID হলে প্রোফাইল, নাহলে জেলা পেজ।
 * `/teachers/online`, `/teachers/sunamganj`, `/teachers/sylhet` স্থির ফোল্ডার,
 * তাই সেগুলো Next.js-ই আগে মেলে; এখানে আলাদা করে লেখা লাগে না।
 */
export function resolveDirectorySlug(slug: string): DirectoryLanding | undefined {
  const district = districtBySlug.get(toSeoSlug(slug));
  if (district) return { kind: "district", landing: district };
  return undefined;
}

export function getDistrictLandingBySlug(slug: string): DistrictLanding | undefined {
  return districtBySlug.get(toSeoSlug(slug));
}

export function getDistrictLandingByName(name: string): DistrictLanding | undefined {
  return districtByName.get(name.trim().toLowerCase());
}

export function getExamLandingBySlug(slug: string): ExamLanding | undefined {
  return examBySlug.get(toSeoSlug(slug));
}

/** শ্রেণির নাম থেকে ল্যান্ডিং পেজ — না থাকলে null (তখন ফিল্টার লিংক ব্যবহার হবে)। */
export function examPathForClassLevel(classLevel?: string | null): string | null {
  if (!classLevel) return null;
  const key = classLevel.trim().toLowerCase();
  const exam = EXAM_LANDINGS.find((item) => item.classLevel.toLowerCase() === key);
  return exam?.path ?? null;
}

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
  // প্রথমে নির্বাচিত লঞ্চ-মার্কেট পেজ, না পেলে ৬৪ জেলার ল্যান্ডিং — এতে প্রতিটি
  // শিক্ষক প্রোফাইল থেকে জেলা পেজে ইন্টারনাল লিংক তৈরি হয়।
  return getFeaturedLocationByName(district)?.path ?? getDistrictLandingByName(district)?.path ?? null;
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
