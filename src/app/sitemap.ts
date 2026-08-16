import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site";
import { isSupabaseConfigured } from "@/lib/env";
import { searchTeachers } from "@/lib/data/teachers";

export const revalidate = 3600;

/** Sitemap of useful public landing pages and currently published teachers. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/teachers`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/leaderboard`, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/safety`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/verification`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.4 },
  ];

  if (!isSupabaseConfigured()) return entries;

  const pageSize = 50;
  let page = 1;
  let total = 0;

  do {
    const result = await searchTeachers({ page, pageSize, sort: "newest" });
    if (!result.data || result.error) break;

    total = result.data.total;
    for (const teacher of result.data.results) {
      entries.push({
        url: `${base}/teachers/${teacher.id}`,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
    page += 1;
  } while ((page - 1) * pageSize < total && page <= 100);

  return entries;
}
