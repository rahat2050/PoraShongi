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
    { url: `${base}/safety`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/verification`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.4 },
  ];
}
