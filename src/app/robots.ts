import type { MetadataRoute } from "next";
import { PRIVATE_ROBOTS_PATHS } from "@/config/seo";
import { getSiteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...PRIVATE_ROBOTS_PATHS],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
