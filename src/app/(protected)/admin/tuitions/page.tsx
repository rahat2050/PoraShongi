import type { Metadata } from "next";
import Link from "next/link";
import { ScrollText } from "lucide-react";
import { adminListTuitions } from "@/lib/data/admin";
import { getProfilesPublic } from "@/lib/data/profiles";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { TuitionStatusBadge } from "@/components/shared/status-badge";
import { AdminDeleteTuitionButton } from "@/features/admin/admin-actions";
import { buildQueryString, firstParam, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin — Tuitions" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminTuitionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(firstParam(sp.page) ?? "1") || 1);

  const result = await adminListTuitions(page, PAGE_SIZE);
  const rows = result.data?.rows ?? [];
  const total = result.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const posterIds = Array.from(new Set(rows.map((r) => r.poster_id)));
  const posters = (await getProfilesPublic(posterIds)).data ?? [];
  const posterMap = new Map(posters.map((p) => [p.id, p]));

  const buildHref = (p: number) =>
    `/admin/tuitions${buildQueryString({ page: p > 1 ? p : undefined })}`;

  return (
    <div>
      <Card>
        <CardContent className="p-0">
          {result.error ? (
            <div className="p-6 text-sm text-red-600">{result.error}</div>
          ) : rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Tuition</th>
                    <th className="px-4 py-3">Poster</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((t) => {
                    const poster = posterMap.get(t.poster_id);
                    return (
                      <tr key={t.id}>
                        <td className="px-4 py-3">
                          <Link
                            href={`/tuitions/${t.id}`}
                            className="font-medium text-slate-800 hover:text-brand-700"
                          >
                            {t.title}
                          </Link>
                          <p className="text-xs text-slate-400">
                            {t.class_level} · {t.subject}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {poster?.display_name || poster?.full_name || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <TuitionStatusBadge status={t.status} />
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {formatDate(t.created_at)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <AdminDeleteTuitionButton tuitionId={t.id} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <EmptyState
                icon={<ScrollText className="h-6 w-6" aria-hidden />}
                title="No tuitions yet"
                description="Tuition posts will appear here."
              />
            </div>
          )}
        </CardContent>
      </Card>
      <div className="mt-6">
        <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
      </div>
    </div>
  );
}
