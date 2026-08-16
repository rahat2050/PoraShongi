import type { MetadataRoute } from "next";

/** Basic sitemap — static পেজ (dynamic teacher/tuition আলাদা করে পরে যোগ করা যায়)। */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/teachers`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/tuitions`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
}
