import { absoluteUrl } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { listBlogPosts } from "@/lib/data/features";
import { isSupabaseConfigured } from "@/lib/env";

export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const posts = isSupabaseConfigured() ? ((await listBlogPosts(30)).data ?? []) : [];
  const items = posts
    .map((post) => {
      const link = absoluteUrl(`/blog/${encodeURIComponent(post.slug)}`);
      const date = post.updated_at || post.created_at;
      return [
        "<item>",
        `<title>${escapeXml(post.title)}</title>`,
        `<link>${escapeXml(link)}</link>`,
        `<guid>${escapeXml(link)}</guid>`,
        post.excerpt ? `<description>${escapeXml(post.excerpt)}</description>` : "",
        date ? `<pubDate>${new Date(date).toUTCString()}</pubDate>` : "",
        "</item>",
      ].filter(Boolean).join("");
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>${escapeXml(`${siteConfig.brandName} Blog`)}</title>
<link>${escapeXml(absoluteUrl("/blog"))}</link>
<description>${escapeXml("PoraSathi শিক্ষা ব্লগে প্রকাশিত পড়াশোনার টিপস ও গাইড।")}</description>
<language>bn-BD</language>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
