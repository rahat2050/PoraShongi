import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  INSTITUTION_LANDINGS,
  getInstitutionLandingBySlug,
  type DirectoryLanding,
} from "@/config/seo";
import { DirectoryLandingPage, directoryLandingMetadata } from "@/features/seo/directory-landing-page";

export const revalidate = 600;

export function generateStaticParams() {
  return INSTITUTION_LANDINGS.map((institution) => ({ slug: institution.slug }));
}

function resolve(slug: string): DirectoryLanding {
  const institution = getInstitutionLandingBySlug(slug);
  if (!institution) notFound();
  return { kind: "institution", landing: institution };
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

export default async function InstitutionLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  return <DirectoryLandingPage landing={resolve(slug)} searchParams={await searchParams} />;
}
