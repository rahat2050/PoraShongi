import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { createClient } from "@/lib/supabase/server";
import { SetupRequired } from "@/components/shared/setup-required";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ROLE_LABELS } from "@/lib/auth/roles";
import {
  StatusBadge,
  VerificationBadge,
} from "@/components/shared/profile-badges";
import { Avatar } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;

  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  if (profile.role !== "admin") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6">
        <ErrorState
          title="Access denied"
          description="You need an administrator account to view this page."
        />
      </div>
    );
  }

  const supabase = await createClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Admin panel</h1>
        <p className="mt-1 text-slate-500">
          All registered users — read-only in Phase 1.
        </p>
      </div>

      {error ? (
        <ErrorState title="Could not load users" description={error.message} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Users ({profiles?.length ?? 0})</CardTitle>
            <CardDescription>
              Access is governed by Row Level Security — only admins can read
              every profile row.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {profiles && profiles.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Verification</th>
                      <th className="px-6 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {profiles.map((row) => (
                      <tr key={row.id}>
                        <td className="px-6 py-3">
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
                        <td className="px-6 py-3 text-slate-700">
                          {ROLE_LABELS[row.role].en}
                        </td>
                        <td className="px-6 py-3">
                          <StatusBadge status={row.account_status} />
                        </td>
                        <td className="px-6 py-3">
                          <VerificationBadge status={row.verification_status} />
                        </td>
                        <td className="px-6 py-3 text-slate-500">
                          {formatDateTime(row.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6">
                <EmptyState
                  icon={<Users className="h-6 w-6" aria-hidden />}
                  title="No users yet"
                  description="Registered users will appear here once people start signing up."
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
