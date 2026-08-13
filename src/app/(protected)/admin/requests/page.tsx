import type { Metadata } from "next";
import Link from "next/link";
import { Send } from "lucide-react";
import { adminListRequests } from "@/lib/data/admin";
import { getProfilesPublic } from "@/lib/data/profiles";
import { getTuitionsByIds } from "@/lib/data/tuitions";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { RequestStatusBadge } from "@/components/shared/status-badge";
import { buildQueryString, firstParam, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin — Requests" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(firstParam(sp.page) ?? "1") || 1);

  const result = await adminListRequests(page, PAGE_SIZE);
  const rows = result.data?.rows ?? [];
  const total = result.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const personIds = Array.from(
    new Set(rows.flatMap((r) => [r.sender_id, r.teacher_id])),
  );
  const tuitionIds = Array.from(new Set(rows.map((r) => r.tuition_id)));

  const [profiles, tuitions] = await Promise.all([
    getProfilesPublic(personIds),
    getTuitionsByIds(tuitionIds),
  ]);
  const profileMap = new Map((profiles.data ?? []).map((p) => [p.id, p]));
  const tuitionMap = new Map((tuitions.data ?? []).map((t) => [t.id, t]));

  const buildHref = (p: number) =>
    `/admin/requests${buildQueryString({ page: p > 1 ? p : undefined })}`;

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
                    <th className="px-4 py-3">From</th>
                    <th className="px-4 py-3">To</th>
                    <th className="px-4 py-3">Tuition</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Sent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r) => {
                    const sender = profileMap.get(r.sender_id);
                    const teacher = profileMap.get(r.teacher_id);
                    const tuition = tuitionMap.get(r.tuition_id);
                    return (
                      <tr key={r.id}>
                        <td className="px-4 py-3 text-slate-700">
                          {sender?.display_name || sender?.full_name || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {teacher?.display_name || teacher?.full_name || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/tuitions/${r.tuition_id}`}
                            className="text-slate-600 hover:text-brand-700"
                          >
                            {tuition?.title ?? "—"}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <RequestStatusBadge status={r.status} />
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {formatDate(r.created_at)}
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
                icon={<Send className="h-6 w-6" aria-hidden />}
                title="No requests yet"
                description="Tuition requests will appear here."
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
