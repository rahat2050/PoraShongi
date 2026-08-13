import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, SearchX } from "lucide-react";
import { searchTuitions } from "@/lib/data/tuitions";
import { getCurrentUser } from "@/lib/auth/server-auth";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupRequired } from "@/components/shared/setup-required";
import { TuitionFilters } from "@/components/shared/tuition-filters";
import { TuitionCard } from "@/components/shared/tuition-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { buttonStyles } from "@/components/ui/button";
import { buildQueryString, firstParam } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tuition requirements",
  description: "Browse tuition requirements across Bangladesh.",
};

const PAGE_SIZE = 12;

export default async function TuitionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const classLevel = firstParam(sp.class);
  const subject = firstParam(sp.subject);
  const location = firstParam(sp.location);
  const mode = firstParam(sp.mode);
  const day = firstParam(sp.day);
  const time = firstParam(sp.time);
  const minBudget = firstParam(sp.minBudget);
  const maxBudget = firstParam(sp.maxBudget);
  const page = Math.max(1, Number(firstParam(sp.page) ?? "1") || 1);

  if (!isSupabaseConfigured()) return <SetupRequired />;

  const user = await getCurrentUser();

  const result = user
    ? await searchTuitions({
        classLevel: classLevel || undefined,
        subject: subject || undefined,
        location: location || undefined,
        mode: mode || undefined,
        day: day || undefined,
        time: time || undefined,
        minBudget: minBudget ? Number(minBudget) : undefined,
        maxBudget: maxBudget ? Number(maxBudget) : undefined,
        page,
        pageSize: PAGE_SIZE,
      })
    : null;

  const totalPages = Math.max(
    1,
    Math.ceil((result?.data?.total ?? 0) / PAGE_SIZE),
  );

  const buildHref = (p: number) =>
    `/tuitions${buildQueryString({
      class: classLevel,
      subject,
      location,
      mode,
      day,
      time,
      minBudget,
      maxBudget,
      page: p > 1 ? p : undefined,
    })}`;

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Tuition requirements</h1>
        <p className="mt-1 text-slate-500">
          Browse tuition requirements posted by students and guardians.
        </p>
      </div>

      <TuitionFilters
        current={{
          classLevel,
          subject,
          location,
          mode,
          day,
          time,
          minBudget,
          maxBudget,
        }}
      />

      <div className="mt-6">
        {!user ? (
          <EmptyState
            icon={<ClipboardList className="h-6 w-6" aria-hidden />}
            title="Sign in to browse tuitions"
            description="Tuition requirements are visible to signed-in members."
            action={
              <Link href={`/login?next=/tuitions`} className={buttonStyles()}>
                Sign in
              </Link>
            }
          />
        ) : result?.error ? (
          <EmptyState
            icon={<SearchX className="h-6 w-6" aria-hidden />}
            title="Could not load tuitions"
            description={result.error}
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-500">
              {result?.data?.total ?? 0} tuition requirement
              {result?.data?.total === 1 ? "" : "s"} found
            </p>
            {result?.data && result.data.results.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {result.data.results.map((tuition) => (
                  <TuitionCard key={tuition.id} tuition={tuition} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<SearchX className="h-6 w-6" aria-hidden />}
                title="No tuitions found"
                description="Try adjusting your filters, or check back soon."
              />
            )}
            <div className="mt-8">
              <Pagination
                page={page}
                totalPages={totalPages}
                buildHref={buildHref}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
