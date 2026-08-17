import type { Metadata } from "next";
import { History } from "lucide-react";
import { adminListAuditLogs } from "@/lib/data/admin";
import { getProfilesPublic } from "@/lib/data/profiles-public";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "অ্যাডমিন অডিট লগ" };
export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  profile_moderation: "প্রোফাইল মডারেশন",
  report_moderation: "রিপোর্ট মডারেশন",
};

export default async function AdminAuditPage() {
  const result = await adminListAuditLogs(50);
  const rows = result.data ?? [];
  const admins = (await getProfilesPublic(Array.from(new Set(rows.map((row) => row.admin_id))))).data ?? [];
  const adminMap = new Map(admins.map((profile) => [profile.id, profile]));

  return (
    <section aria-labelledby="audit-heading">
      <div className="mb-5 flex items-center gap-3">
        <History className="h-6 w-6 text-brand-700 dark:text-brand-300" aria-hidden />
        <div>
          <h2 id="audit-heading" className="text-xl font-semibold text-slate-900 dark:text-slate-100">অডিট লগ</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">ভেরিফিকেশন, অ্যাকাউন্ট ও রিপোর্ট মডারেশনের অপরিবর্তনীয় ইতিহাস।</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {result.error ? (
            <p className="p-6 text-sm text-red-600 dark:text-red-400">{result.error}</p>
          ) : rows.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={<History className="h-6 w-6" aria-hidden />} title="এখনো কোনো অডিট ইভেন্ট নেই" />
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {rows.map((row) => {
                const admin = adminMap.get(row.admin_id);
                return (
                  <article key={row.id} className="grid gap-2 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{ACTION_LABELS[row.action] ?? row.action}</Badge>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{row.target_type}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                        অ্যাডমিন: {admin?.display_name || admin?.full_name || `${row.admin_id.slice(0, 8)}…`}
                      </p>
                      {row.target_id && <p className="text-xs text-slate-500 dark:text-slate-400">Target: {row.target_id}</p>}
                    </div>
                    <time className="text-xs text-slate-500 dark:text-slate-400" dateTime={row.created_at}>{formatDateTime(row.created_at)}</time>
                  </article>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
