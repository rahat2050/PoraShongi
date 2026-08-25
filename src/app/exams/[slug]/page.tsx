import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EXAM_LANDINGS, getExamLandingBySlug, type DirectoryLanding } from "@/config/seo";
import { DirectoryLandingPage, directoryLandingMetadata } from "@/features/seo/directory-landing-page";

export const revalidate = 600;

export function generateStaticParams() {
  return EXAM_LANDINGS.map((exam) => ({ slug: exam.slug }));
}

function resolve(slug: string): DirectoryLanding {
  const exam = getExamLandingBySlug(slug);
  if (!exam) notFound();
  return { kind: "exam", landing: exam };
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

export default async function ExamLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  return <DirectoryLandingPage landing={resolve(slug)} searchParams={await searchParams} />;
}
