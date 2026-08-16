import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site";

/** Basic sitemap — public static pages. Dynamic profile URLs are added separately. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/teachers`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/tuitions`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/leaderboard`, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/coaching`, changeFrequency: "weekly", priority: 0.6 },
  ];
}
