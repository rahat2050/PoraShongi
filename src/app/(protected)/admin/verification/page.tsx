import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";
import { adminListPendingVerifications } from "@/lib/data/admin";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Avatar } from "@/components/ui/avatar";
import { AdminVerifyButton } from "@/features/admin/admin-actions";
import { buildQueryString, firstParam, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin — Verification" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminVerificationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(firstParam(sp.page) ?? "1") || 1);

  const result = await adminListPendingVerifications(page, PAGE_SIZE);
  const rows = result.data?.rows ?? [];
  const total = result.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (p: number) =>
    `/admin/verification${buildQueryString({ page: p > 1 ? p : undefined })}`;

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
                    <th className="px-4 py-3">Teacher</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Requested</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={row.avatar_url}
                            name={row.full_name ?? row.display_name}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-slate-800">
                              {row.full_name ?? row.display_name ?? "—"}
                            </p>
                            <p className="text-xs text-slate-400">
                              {row.id.slice(0, 8)}…
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {row.location || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {row.phone ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {formatDate(row.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <AdminVerifyButton teacherId={row.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <EmptyState
                icon={<BadgeCheck className="h-6 w-6" aria-hidden />}
                title="No pending verifications"
                description="Teachers requesting verification will appear here."
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
