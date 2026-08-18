import type { Metadata } from "next";
import Link from "next/link";
import { adminListTuitions } from "@/lib/data/admin";
import { type TuitionStatus } from "@/types/index";
import { firstParam, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TuitionStatusBadge } from "@/components/shared/status-badge";
import { AdminTuitionFeatureToggle } from "@/features/admin/tuition-feature-toggle";

export const metadata: Metadata = { title: "অ্যাডমিন — টিউশন" };
export const dynamic = "force-dynamic";
const STATUSES: TuitionStatus[] = ["open", "assigned", "paused", "completed", "closed"];

export default async function AdminTuitionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const rawStatus = firstParam(params.status);
  const status = STATUSES.includes(rawStatus as TuitionStatus) ? rawStatus as TuitionStatus : undefined;
  const page = Math.max(1, Number(firstParam(params.page) ?? "1") || 1);
  const result = await adminListTuitions(page, 30, status);
  const rows = result.data?.rows ?? [];
  const totalPages = Math.max(1, Math.ceil((result.data?.total ?? 0) / 30));

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        <Link href="/admin/tuitions" className="rounded-lg border px-3 py-2 text-sm">সব</Link>
        {STATUSES.map((item) => <Link key={item} href={`/admin/tuitions?status=${item}`} className={`rounded-lg border px-3 py-2 text-sm ${status === item ? "border-brand-700 bg-brand-700 text-white" : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"}`}>{item}</Link>)}
      </div>
      <Card>
        <CardContent className="p-0">
          {result.error ? <p className="p-6 text-sm text-red-600">{result.error}</p> : rows.length === 0 ? (
            <div className="p-6"><EmptyState title="কোনো টিউশন নেই" description="ফিল্টারে টিউশন পাওয়া যায়নি।" /></div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {rows.map((tuition) => (
                <article key={tuition.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/tuitions/${tuition.id}`} className="font-semibold text-slate-900 hover:text-brand-700 dark:text-slate-100">{tuition.title}</Link>
                      <TuitionStatusBadge status={tuition.status} />
                      {tuition.is_featured && <Badge variant="accent">Featured</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{tuition.subject} · {tuition.class_level} · {formatDate(tuition.created_at)}</p>
                  </div>
                  <AdminTuitionFeatureToggle tuitionId={tuition.id} featured={tuition.is_featured} open={tuition.status === "open"} />
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <div className="mt-3 flex items-center justify-between gap-3 text-sm">
        <p className="text-xs text-slate-500">মোট {result.data?.total ?? 0}টি · পেজ {page}/{totalPages}</p>
        <div className="flex gap-2">
          {page > 1 && <Link className="rounded-lg border px-3 py-2" href={`/admin/tuitions?${status ? `status=${status}&` : ""}page=${page - 1}`}>আগের</Link>}
          {page < totalPages && <Link className="rounded-lg border px-3 py-2" href={`/admin/tuitions?${status ? `status=${status}&` : ""}page=${page + 1}`}>পরের</Link>}
        </div>
      </div>
    </div>
  );
}
