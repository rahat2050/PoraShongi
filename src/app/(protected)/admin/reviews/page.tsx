import type { Metadata } from "next";
import { Star } from "lucide-react";
import { adminListReviews } from "@/lib/data/admin";
import { getProfilesPublic } from "@/lib/data/profiles";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { AdminReviewActions } from "@/features/admin/admin-moderation-actions";
import { buildQueryString, firstParam, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin — Reviews" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  published: "success",
  hidden: "warning",
  removed: "danger",
};

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(firstParam(sp.page) ?? "1") || 1);

  const result = await adminListReviews(page, PAGE_SIZE);
  const rows = result.data?.rows ?? [];
  const total = result.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const personIds = Array.from(
    new Set(rows.flatMap((r) => [r.teacher_id, r.reviewer_id])),
  );
  const people = (await getProfilesPublic(personIds)).data ?? [];
  const peopleMap = new Map(people.map((p) => [p.id, p]));

  const buildHref = (p: number) =>
    `/admin/reviews${buildQueryString({ page: p > 1 ? p : undefined })}`;

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
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Teacher</th>
                    <th className="px-4 py-3">Reviewer</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r) => {
                    const teacher = peopleMap.get(r.teacher_id);
                    const reviewer = peopleMap.get(r.reviewer_id);
                    return (
                      <tr key={r.id}>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 font-medium text-slate-800">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                            {r.rating}/5
                            {r.verified && <Badge variant="success">Verified</Badge>}
                          </span>
                          {r.body && (
                            <p className="mt-1 max-w-[16rem] truncate text-xs text-slate-500">{r.body}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {teacher?.display_name || teacher?.full_name || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {reviewer?.display_name || reviewer?.full_name || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={STATUS_VARIANT[r.status] ?? "default"}>{r.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{formatDate(r.created_at)}</td>
                        <td className="px-4 py-3 text-right">
                          <AdminReviewActions reviewId={r.id} />
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
                icon={<Star className="h-6 w-6" aria-hidden />}
                title="No reviews yet"
                description="Reviews will appear here for moderation."
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
