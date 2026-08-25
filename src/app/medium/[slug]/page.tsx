import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MEDIUM_LANDINGS, getMediumLandingBySlug, type DirectoryLanding } from "@/config/seo";
import { DirectoryLandingPage, directoryLandingMetadata } from "@/features/seo/directory-landing-page";

export const revalidate = 600;

export function generateStaticParams() {
  return MEDIUM_LANDINGS.map((medium) => ({ slug: medium.slug }));
}

function resolve(slug: string): DirectoryLanding {
  const medium = getMediumLandingBySlug(slug);
  if (!medium) notFound();
  return { kind: "medium", landing: medium };
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { slug } = await params;
  return directoryLandingMetadata(resolve(slug), await searchParams);
}

export default async function MediumLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  return <DirectoryLandingPage landing={resolve(slug)} searchParams={await searchParams} />;
}
