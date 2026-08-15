import type { Metadata } from "next";
import { Flag } from "lucide-react";
import { adminListReports } from "@/lib/data/admin";
import { getProfilesPublic } from "@/lib/data/profiles-public";
import { type Report } from "@/types/index";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { AdminReportButtons } from "@/features/admin/admin-actions";
import { buildQueryString, firstParam, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "অ্যাডমিন — রিপোর্ট" };
export const dynamic = "force-dynamic";

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
  const status: Report["status"] | undefined = ["open", "investigating", "resolved", "dismissed"].includes(statusParam ?? "")
    ? (statusParam as Report["status"])
    : undefined;

  const result = await adminListReports(1, 50, status);
  const rows = result.data?.rows ?? [];

  const reporters = (await getProfilesPublic(rows.map((r) => r.reporter_id))).data ?? [];
  const reporterMap = new Map(reporters.map((p) => [p.id, p]));

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { value: undefined, label: "সব" },
          { value: "open", label: "খোলা" },
          { value: "investigating", label: "তদন্তে" },
          { value: "resolved", label: "সমাধান" },
        ].map((f) => (
          <a
            key={f.label}
            href={`/admin/reports${buildQueryString({ status: f.value })}`}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              (status ?? undefined) === f.value ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-600 hover:border-brand-400"
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
          ) : rows.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={<Flag className="h-6 w-6" aria-hidden />} title="কোনো রিপোর্ট নেই" description="ব্যবহারকারীরা রিপোর্ট করলে এখানে দেখাবে।" />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {rows.map((r) => {
                const reporter = reporterMap.get(r.reporter_id);
                return (
                  <div key={r.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="capitalize">{r.target_type}</Badge>
                        <Badge variant="outline">{r.category.replace("_", " ")}</Badge>
                        <Badge variant={STATUS_VARIANT[r.status] ?? "default"}>{r.status}</Badge>
                      </div>
                      {r.details && <p className="mt-1.5 text-sm text-slate-600">{r.details}</p>}
                      <p className="mt-1 text-xs text-slate-400">
                        রিপোর্টার: {reporter?.display_name || reporter?.full_name || "—"} · {formatDate(r.created_at)}
                      </p>
                    </div>
                    <AdminReportButtons reportId={r.id} />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
