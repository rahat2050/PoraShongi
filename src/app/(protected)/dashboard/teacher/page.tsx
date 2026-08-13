import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Inbox, Plus, ScrollText } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { getRoleProfileRow, computeProfileCompletion } from "@/lib/data/profiles";
import { listTuitionsFor, getTuitionsByIds } from "@/lib/data/tuitions";
import {
  listReceivedRequests,
  listAcceptedTuitionIds,
  loadRequestDisplay,
} from "@/lib/data/requests";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { ProfileCompletion } from "@/components/shared/profile-completion";
import { TuitionStatusBadge } from "@/components/shared/status-badge";
import { RequestRow } from "@/components/shared/request-row";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Teacher dashboard" };

export default async function TeacherDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "teacher") redirect("/dashboard");

  const roleProfileResult = await getRoleProfileRow(profile);
  const completion = computeProfileCompletion(profile, roleProfileResult.data);

  const [tuitions, receivedRequests, acceptedIds] = await Promise.all([
    listTuitionsFor(profile.id),
    listReceivedRequests(profile.id),
    listAcceptedTuitionIds(profile.id),
  ]);

  const tuitionList = tuitions.data ?? [];
  const requestList = receivedRequests.data ?? [];
  const activeTuitions =
    (acceptedIds.data ?? []).length > 0
      ? ((await getTuitionsByIds(acceptedIds.data!)).data ?? [])
      : [];

  const pendingCount = requestList.filter((r) => r.status === "pending").length;
  const receivedRows = await loadRequestDisplay(requestList.slice(0, 5), "received");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Teacher dashboard</h1>
          <p className="mt-1 text-slate-500">
            Manage your tuitions and tuition requests.
          </p>
        </div>
        <Badge variant="brand">
          {ROLE_LABELS.teacher.en} · {ROLE_LABELS.teacher.bn}
        </Badge>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ProfileCompletion
            percent={completion.percent}
            missing={completion.missing}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
          <StatCard
            label="My tuitions"
            value={tuitionList.length}
            icon={<ScrollText className="h-5 w-5" aria-hidden />}
            href="/dashboard/tuitions"
          />
          <StatCard
            label="Pending requests"
            value={pendingCount}
            icon={<Inbox className="h-5 w-5" aria-hidden />}
            href="/dashboard/requests?tab=received"
          />
          <StatCard
            label="Active tuitions"
            value={activeTuitions.length}
            icon={<CheckCircle2 className="h-5 w-5" aria-hidden />}
            href="/dashboard/requests?tab=received"
          />
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Tuition requests
              </h2>
              <Link
                href="/dashboard/requests?tab=received"
                className="text-sm font-medium text-brand-700 hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="mt-2 divide-y divide-slate-100">
              {receivedRows.length === 0 ? (
                <EmptyState
                  title="No requests yet"
                  description="Tuition requests from students will appear here."
                />
              ) : (
                receivedRows.map((row) => (
                  <RequestRow key={row.request.id} row={row} direction="received" />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                My tuitions
              </h2>
              <Link
                href="/dashboard/tuitions/new"
                className={buttonStyles({ variant: "primary", size: "sm" })}
              >
                <Plus className="h-4 w-4" aria-hidden />
                New tuition
              </Link>
            </div>
            <div className="mt-4 divide-y divide-slate-100">
              {tuitionList.length === 0 ? (
                <EmptyState
                  title="No tuitions yet"
                  description="Create a tuition listing to advertise your availability."
                />
              ) : (
                tuitionList.slice(0, 4).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/tuitions/${t.id}`}
                        className="block truncate text-sm font-medium text-slate-800 hover:text-brand-700"
                      >
                        {t.title}
                      </Link>
                      <p className="text-xs text-slate-400">
                        {t.class_level} · {t.subject}
                      </p>
                    </div>
                    <TuitionStatusBadge status={t.status} />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
