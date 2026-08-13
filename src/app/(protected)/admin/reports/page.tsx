import type { Metadata } from "next";
import { Flag } from "lucide-react";
import { adminListReports } from "@/lib/data/admin";
import { getProfilesPublic } from "@/lib/data/profiles";
import { type Report } from "@/types/index";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { AdminReportActions } from "@/features/admin/admin-moderation-actions";
import { buildQueryString, firstParam, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin — Reports" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  open: "danger",
  investigating: "warning",
  resolved: "success",
  dismissed: "default",
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const statusParam = firstParam(sp.status);
  const status: Report["status"] | undefined = ["open", "investigating", "resolved", "dismissed"].includes(
    statusParam ?? "",
  )
    ? (statusParam as Report["status"])
    : undefined;
  const page = Math.max(1, Number(firstParam(sp.page) ?? "1") || 1);

  const result = await adminListReports(page, PAGE_SIZE, status);
  const rows = result.data?.rows ?? [];
  const total = result.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const reporterIds = Array.from(new Set(rows.map((r) => r.reporter_id)));
  const reporters = (await getProfilesPublic(reporterIds)).data ?? [];
  const reporterMap = new Map(reporters.map((p) => [p.id, p]));

  const buildHref = (p: number) =>
    `/admin/reports${buildQueryString({ status, page: p > 1 ? p : undefined })}`;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { value: undefined, label: "All" },
          { value: "open", label: "Open" },
          { value: "investigating", label: "Investigating" },
          { value: "resolved", label: "Resolved" },
          { value: "dismissed", label: "Dismissed" },
        ].map((f) => (
          <a
            key={f.label}
            href={`/admin/reports${buildQueryString({ status: f.value })}`}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              (status ?? undefined) === f.value
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:border-brand-400"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {result.error ? (
            <div className="p-6 text-sm text-red-600">{result.error}</div>
          ) : rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Target</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Reporter</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r) => {
                    const reporter = reporterMap.get(r.reporter_id);
                    return (
                      <tr key={r.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800 capitalize">{r.target_type}</p>
                          <p className="text-xs text-slate-400">{r.target_id.slice(0, 8)}…</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{r.category.replace("_", " ")}</Badge>
                          {r.details && (
                            <p className="mt-1 max-w-[16rem] truncate text-xs text-slate-500">{r.details}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {reporter?.display_name || reporter?.full_name || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={STATUS_VARIANT[r.status] ?? "default"}>{r.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{formatDate(r.created_at)}</td>
                        <td className="px-4 py-3 text-right">
                          <AdminReportActions reportId={r.id} />
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
                icon={<Flag className="h-6 w-6" aria-hidden />}
                title="No reports"
                description="User reports will appear here for moderation."
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
