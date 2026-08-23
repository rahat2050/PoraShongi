import type { Metadata } from "next";
import { LocationTeachersPage, locationPageMetadata } from "@/features/seo/location-teachers-page";
import { firstParam } from "@/lib/utils";

export const revalidate = 300;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const page = Math.max(1, Number(firstParam((await searchParams).page) ?? "1") || 1);
  return locationPageMetadata("sunamganj", page);
}

export default async function SunamganjTeachersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <LocationTeachersPage slug="sunamganj" searchParams={searchParams} />;
}
