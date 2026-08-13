import type { Metadata } from "next";
import { Users } from "lucide-react";
import { adminListProfiles } from "@/lib/data/admin";
import { Card, CardContent } from "@/components/ui/card";
import { AdminUserTable } from "@/components/shared/admin-user-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { buildQueryString, firstParam } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin — Students" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(firstParam(sp.page) ?? "1") || 1);

  const result = await adminListProfiles("student", page, PAGE_SIZE);
  const total = result.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const buildHref = (p: number) =>
    `/admin/students${buildQueryString({ page: p > 1 ? p : undefined })}`;

  return (
    <div>
      <Card>
        <CardContent className="p-0">
          {result.error ? (
            <div className="p-6 text-sm text-red-600">{result.error}</div>
          ) : result.data && result.data.rows.length > 0 ? (
            <AdminUserTable profiles={result.data.rows} />
          ) : (
            <div className="p-6">
              <EmptyState
                icon={<Users className="h-6 w-6" aria-hidden />}
                title="No students yet"
                description="Students will appear here once they sign up."
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
