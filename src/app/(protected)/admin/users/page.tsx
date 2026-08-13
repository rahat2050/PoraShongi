import type { Metadata } from "next";
import { adminListProfiles } from "@/lib/data/admin";
import { type UserRole } from "@/lib/auth/roles";
import { Card, CardContent } from "@/components/ui/card";
import { AdminUserTable } from "@/components/shared/admin-user-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Users } from "lucide-react";
import { buildQueryString, firstParam } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin — Users" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const roleParam = firstParam(sp.role);
  const role: UserRole | undefined = ["student", "teacher", "guardian", "admin"].includes(
    roleParam ?? "",
  )
    ? (roleParam as UserRole)
    : undefined;
  const page = Math.max(1, Number(firstParam(sp.page) ?? "1") || 1);

  const result = await adminListProfiles(role, page, PAGE_SIZE);
  const total = result.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (p: number) =>
    `/admin/users${buildQueryString({ role, page: p > 1 ? p : undefined })}`;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { value: undefined, label: "All" },
          { value: "student", label: "Students" },
          { value: "teacher", label: "Teachers" },
          { value: "guardian", label: "Guardians" },
          { value: "admin", label: "Admins" },
        ].map((f) => (
          <a
            key={f.label}
            href={`/admin/users${buildQueryString({ role: f.value })}`}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              (role ?? undefined) === f.value
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
          ) : result.data && result.data.rows.length > 0 ? (
            <AdminUserTable profiles={result.data.rows} showVerify />
          ) : (
            <div className="p-6">
              <EmptyState
                icon={<Users className="h-6 w-6" aria-hidden />}
                title="No users found"
                description="Users will appear here once people sign up."
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
