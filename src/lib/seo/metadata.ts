import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE, INDEX_FOLLOW, absoluteUrl, truncateMeta } from "@/config/seo";
import { siteConfig } from "@/config/site";

type RobotsValue = NonNullable<Metadata["robots"]>;

export interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  canonical?: string;
  robots?: RobotsValue;
  ogType?: "website" | "article" | "profile";
  image?: string;
  imageAlt?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export function buildPageMetadata({
  title,
  description,
  path,
  canonical,
  robots = INDEX_FOLLOW,
  ogType = "website",
  image,
  imageAlt,
  publishedTime,
  modifiedTime,
}: PageMetadataInput): Metadata {
  const canonicalPath = canonical ?? path;
  const desc = truncateMeta(description);
  const imageUrl = image || DEFAULT_OG_IMAGE.url;
  const alt = imageAlt || DEFAULT_OG_IMAGE.alt;

  return {
    title,
    description: desc,
    alternates: { canonical: canonicalPath },
    robots,
    openGraph: {
      type: ogType,
      url: canonicalPath,
      siteName: siteConfig.brandName,
      locale: "bn_BD",
      title,
      description: desc,
      images: [{ url: imageUrl, width: 1200, height: 630, alt }],
      ...(ogType === "article"
        ? {
            publishedTime,
            modifiedTime,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [imageUrl],
    },
  };
}

export function noIndexMetadata(title: string, description?: string): Metadata {
  return {
    title,
    description,
    robots: { index: false, follow: false, nocache: true },
  };
}

export function paginatedDirectoryMetadata(
  input: Omit<PageMetadataInput, "canonical"> & { page: number },
): Metadata {
  if (input.page > 1) {
    return buildPageMetadata({
      ...input,
      title: `${input.title} · পাতা ${input.page}`,
      canonical: `${input.path}?page=${input.page}`,
    });
  }
  return buildPageMetadata(input);
}

export function googleSiteVerification(): Metadata["verification"] | undefined {
  const code = process.env.NEXT_PUBLIC_GSC_VERIFICATION?.trim();
  return code ? { google: code } : undefined;
}

export function metadataBaseUrl(): URL {
  return new URL(absoluteUrl("/"));
}
