import type { Metadata } from "next";
import { Users } from "lucide-react";
import { adminListProfiles } from "@/lib/data/admin";
import { type UserRole } from "@/lib/auth/roles";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { AdminAccountButtons, AdminVerifyButtons } from "@/features/admin/admin-actions";
import { buildQueryString, firstParam } from "@/lib/utils";

export const metadata: Metadata = { title: "অ্যাডমিন — ব্যবহারকারী" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const roleParam = firstParam(sp.role);
  const role: UserRole | undefined = ["student", "teacher", "guardian", "admin"].includes(roleParam ?? "")
    ? (roleParam as UserRole)
    : undefined;
  const page = Math.max(1, Number(firstParam(sp.page) ?? "1") || 1);

  const result = await adminListProfiles(role, page, PAGE_SIZE);
  const rows = result.data?.rows ?? [];
  const total = result.data?.total ?? 0;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { value: undefined, label: "সব" },
          { value: "teacher", label: "শিক্ষক" },
          { value: "student", label: "শিক্ষার্থী" },
          { value: "guardian", label: "অভিভাবক" },
        ].map((f) => (
          <a
            key={f.label}
            href={`/admin/users${buildQueryString({ role: f.value })}`}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              (role ?? undefined) === f.value ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-600 hover:border-brand-400"
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
              <EmptyState icon={<Users className="h-6 w-6" aria-hidden />} title="কোনো ব্যবহারকারী নেই" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">ব্যবহারকারী</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">ভেরিফিকেশন</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={p.avatar_url} name={p.full_name ?? p.display_name} size="sm" />
                          <div>
                            <p className="font-medium text-slate-800">{p.full_name ?? p.display_name ?? "—"}</p>
                            <p className="text-xs text-slate-400">{p.id.slice(0, 8)}…</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{ROLE_LABELS[p.role].bn}</td>
                      <td className="px-4 py-3"><Badge variant={p.account_status === "active" ? "success" : "danger"}>{p.account_status}</Badge></td>
                      <td className="px-4 py-3"><Badge variant={p.verification_status === "verified" ? "success" : "default"}>{p.verification_status}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {p.role === "teacher" && p.verification_status !== "verified" && <AdminVerifyButtons teacherId={p.id} />}
                          {p.role !== "admin" && <AdminAccountButtons userId={p.id} status={p.account_status} />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-400">মোট {total} জন (পেজ {page})</p>
        </CardContent>
      </Card>
    </div>
  );
}
