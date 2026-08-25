import type { MetadataRoute } from "next";
import {
  DISTRICT_LANDINGS,
  EXAM_LANDINGS,
  FEATURED_LOCATIONS,
  SUBJECT_LANDINGS,
  teacherProfilePath,
} from "@/config/seo";
import { getSiteUrl } from "@/config/site";
import { listCoachingCenters } from "@/lib/data/ecosystem";
import { searchPublicTuitions } from "@/lib/data/tuitions";
import { listBlogPosts } from "@/lib/data/features";
import { searchTeachers } from "@/lib/data/teachers";
import { isSupabaseConfigured } from "@/lib/env";

export const revalidate = 3600;

function entry(
  path: string,
  extras: Omit<MetadataRoute.Sitemap[number], "url"> = {},
): MetadataRoute.Sitemap[number] {
  const base = getSiteUrl().replace(/\/+$/, "");
  return {
    url: path === "/" ? `${base}/` : `${base}${path}`,
    ...extras,
  };
}

/** Canonical, public, indexable URLs only. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    entry("/", { changeFrequency: "weekly", priority: 1 }),
    entry("/hire-tutor", { changeFrequency: "monthly", priority: 0.95 }),
    entry("/teachers", { changeFrequency: "daily", priority: 0.9 }),
    entry("/tuitions", { changeFrequency: "daily", priority: 0.9 }),
    entry("/teachers/online", { changeFrequency: "daily", priority: 0.8 }),
    entry("/locations", { changeFrequency: "weekly", priority: 0.8 }),
    entry("/subjects", { changeFrequency: "weekly", priority: 0.8 }),
    ...FEATURED_LOCATIONS.map((location) =>
      entry(location.path, { changeFrequency: "daily", priority: 0.85 }),
    ),
    ...SUBJECT_LANDINGS.map((subject) =>
      entry(subject.path, { changeFrequency: "weekly", priority: 0.7 }),
    ),
    entry("/how-it-works", { changeFrequency: "monthly", priority: 0.7 }),
    entry("/about", { changeFrequency: "monthly", priority: 0.6 }),
    entry("/leaderboard", { changeFrequency: "daily", priority: 0.6 }),
    entry("/blog", { changeFrequency: "weekly", priority: 0.6 }),
    entry("/coaching", { changeFrequency: "weekly", priority: 0.5 }),
    entry("/resources", { changeFrequency: "weekly", priority: 0.5 }),
    entry("/app", { changeFrequency: "monthly", priority: 0.5 }),
    entry("/affiliate", { changeFrequency: "monthly", priority: 0.5 }),
    entry("/careers", { changeFrequency: "monthly", priority: 0.35 }),
    entry("/premium", { changeFrequency: "monthly", priority: 0.4 }),
    entry("/safety", { changeFrequency: "monthly", priority: 0.5 }),
    entry("/verification", { changeFrequency: "monthly", priority: 0.4 }),
    entry("/contact", { changeFrequency: "yearly", priority: 0.4 }),
    entry("/privacy", { changeFrequency: "yearly", priority: 0.3 }),
    entry("/terms", { changeFrequency: "yearly", priority: 0.3 }),
  ];

  if (!isSupabaseConfigured()) return entries;

  const [postsResult, centersResult] = await Promise.all([
    listBlogPosts(100),
    listCoachingCenters(),
  ]);

  for (const post of postsResult.data ?? []) {
    entries.push(
      entry(`/blog/${encodeURIComponent(post.slug)}`, {
        changeFrequency: "monthly",
        priority: 0.5,
        ...(post.updated_at || post.created_at
          ? { lastModified: new Date(post.updated_at || post.created_at) }
          : {}),
      }),
    );
  }

  for (const center of centersResult.data ?? []) {
    entries.push(
      entry(`/coaching/${center.id}`, {
        changeFrequency: "weekly",
        priority: 0.45,
        ...(center.updated_at || center.created_at
          ? { lastModified: new Date(center.updated_at || center.created_at) }
          : {}),
      }),
    );
  }

  // Open tuition detail pages are indexable teasers (see 0034 migration).
  const tuitionResult = await searchPublicTuitions({ page: 1, pageSize: 50 });
  for (const tuition of tuitionResult.data?.results ?? []) {
    entries.push(
      entry(`/tuitions/${tuition.id}`, {
        changeFrequency: "daily",
        priority: 0.6,
        ...(tuition.created_at ? { lastModified: new Date(tuition.created_at) } : {}),
      }),
    );
  }

  const pageSize = 50;
  let page = 1;
  let total = 0;
  /** যেসব জেলা/শ্রেণিতে সত্যিই প্রকাশিত শিক্ষক আছে — খালি ল্যান্ডিং ইনডেক্স করা হয় না। */
  const districtsSeen = new Set<string>();
  const classesSeen = new Set<string>();

  do {
    const result = await searchTeachers({ page, pageSize, sort: "newest" });
    if (!result.data || result.error) break;

    total = result.data.total;
    for (const teacher of result.data.results) {
      entries.push(
        entry(teacherProfilePath(teacher.id), {
          changeFrequency: "weekly",
          priority: 0.7,
          ...(teacher.created_at ? { lastModified: new Date(teacher.created_at) } : {}),
        }),
      );
      if (teacher.district) districtsSeen.add(teacher.district.trim().toLowerCase());
      for (const level of teacher.classes_taught ?? []) classesSeen.add(level.trim().toLowerCase());
    }
    page += 1;
  } while ((page - 1) * pageSize < total && page <= 100);

  // ৬৪ জেলার ল্যান্ডিং — শুধু যেখানে অন্তত একজন প্রকাশিত শিক্ষক আছেন।
  // (FEATURED_LOCATIONS আগেই নিঃশর্তে যোগ করা, তাই সেগুলো বাদ দিচ্ছি।)
  const featuredPaths = new Set<string>(FEATURED_LOCATIONS.map((location) => location.path));
  for (const district of DISTRICT_LANDINGS) {
    if (featuredPaths.has(district.path)) continue;
    if (!districtsSeen.has(district.name.toLowerCase())) continue;
    entries.push(entry(district.path, { changeFrequency: "weekly", priority: 0.65 }));
  }

  // পরীক্ষা/শ্রেণি-ভিত্তিক ল্যান্ডিং — একই নিয়ম।
  let examEntries = 0;
  for (const exam of EXAM_LANDINGS) {
    if (!classesSeen.has(exam.classLevel.toLowerCase())) continue;
    entries.push(entry(exam.path, { changeFrequency: "weekly", priority: 0.65 }));
    examEntries += 1;
  }
  if (examEntries > 0) {
    entries.push(entry("/exams", { changeFrequency: "weekly", priority: 0.7 }));
  }

  return entries;
}
