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
  title: "টিউশন খুঁজুন",
  description: "লগইন করে আপনার জন্য প্রকাশিত টিউশন খুঁজুন।",
  robots: { index: false, follow: false, nocache: true },
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
  const district = firstParam(sp.district);
  const area = firstParam(sp.area);
  const mode = firstParam(sp.mode);
  const day = firstParam(sp.day);
  const time = firstParam(sp.time);
  const minBudget = firstParam(sp.minBudget);
  const maxBudget = firstParam(sp.maxBudget);
  const page = Math.max(1, Number(firstParam(sp.page) ?? "1") || 1);

  if (!isSupabaseConfigured()) return <SetupRequired />;

  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-slate-900">লগইন প্রয়োজন</h1>
        <p className="mt-2 text-slate-500">টিউশন দেখতে লগইন করুন।</p>
        <Link href={`/login?next=/tuitions`} className={buttonStyles({ className: "mt-6" })}>লগইন করুন</Link>
      </div>
    );
  }

  const result = await searchTuitions({
    classLevel: classLevel || undefined,
    subject: subject || undefined,
    district: district || undefined,
    area: area || undefined,
    mode: mode || undefined,
    day: day || undefined,
    time: time || undefined,
    minBudget: minBudget ? Number(minBudget) : undefined,
    maxBudget: maxBudget ? Number(maxBudget) : undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const total = result.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (p: number) =>
    `/tuitions${buildQueryString({
      class: classLevel,
      subject,
      district,
      area,
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
        <h1 className="text-2xl font-bold text-slate-900">টিউশন খুঁজুন</h1>
        <p className="mt-1 text-slate-500">শিক্ষার্থী ও অভিভাবকের প্রকাশিত টিউশন দেখুন।</p>
      </div>

      <TuitionFilters current={{ classLevel, subject, district, area, mode, day, time, minBudget, maxBudget }} />

      <div className="mt-6">
        {result.error ? (
          <EmptyState icon={<SearchX className="h-6 w-6" aria-hidden />} title="টিউশন লোড করা যায়নি" description={result.error} />
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-500">{total}টি টিউশন পাওয়া গেছে</p>
            {total > 0 && result.data ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {result.data.results.map((tuition) => <TuitionCard key={tuition.id} tuition={tuition} />)}
              </div>
            ) : (
              <EmptyState
                icon={<ClipboardList className="h-6 w-6" aria-hidden />}
                title="কোনো টিউশন পাওয়া যায়নি"
                description="ফিল্টার বদলে দেখুন।"
              />
            )}
            <div className="mt-8">
              <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
