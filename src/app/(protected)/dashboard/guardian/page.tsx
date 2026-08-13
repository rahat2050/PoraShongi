import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, ScrollText, Send, Users } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import {
  getRoleProfileRow,
  computeProfileCompletion,
  getProfilesPublic,
} from "@/lib/data/profiles";
import { listTuitionsFor } from "@/lib/data/tuitions";
import { listSentRequests, loadRequestDisplay } from "@/lib/data/requests";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { type GuardianProfile } from "@/types/index";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { ProfileCompletion } from "@/components/shared/profile-completion";
import { TuitionStatusBadge } from "@/components/shared/status-badge";
import { RequestRow } from "@/components/shared/request-row";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Guardian dashboard" };

export default async function GuardianDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "guardian") redirect("/dashboard");

  const roleProfileResult = await getRoleProfileRow(profile);
  const guardianProfile = roleProfileResult.data as GuardianProfile | null;
  const completion = computeProfileCompletion(profile, guardianProfile);

  const linkedStudentId = guardianProfile?.linked_student_id ?? null;
  const linkedStudent = linkedStudentId
    ? (await getProfilesPublic([linkedStudentId])).data?.[0] ?? null
    : null;

  const [tuitions, sentRequests] = await Promise.all([
    listTuitionsFor(profile.id, linkedStudentId),
    listSentRequests(profile.id, linkedStudentId),
  ]);

  const tuitionList = tuitions.data ?? [];
  const requestList = sentRequests.data ?? [];
  const pendingCount = requestList.filter((r) => r.status === "pending").length;
  const sentRows = await loadRequestDisplay(requestList.slice(0, 4), "sent");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Guardian dashboard</h1>
          <p className="mt-1 text-slate-500">
            Manage your linked student&apos;s tuition journey.
          </p>
        </div>
        <Badge variant="brand">
          {ROLE_LABELS.guardian.en} · {ROLE_LABELS.guardian.bn}
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
            label="Tuition requirements"
            value={tuitionList.length}
            icon={<ScrollText className="h-5 w-5" aria-hidden />}
            href="/dashboard/tuitions"
          />
          <StatCard
            label="Pending requests"
            value={pendingCount}
            icon={<Send className="h-5 w-5" aria-hidden />}
            href="/dashboard/requests?tab=sent"
          />
          <StatCard
            label="Linked student"
            value={linkedStudent ? 1 : 0}
            icon={<Users className="h-5 w-5" aria-hidden />}
            href="/profile"
            hrefLabel="Manage linked student"
          />
        </div>
      </div>

      {linkedStudent && (
        <Card className="mt-6">
          <CardContent className="flex items-center gap-4 p-5">
            <Avatar
              src={linkedStudent.avatar_url}
              name={linkedStudent.full_name ?? undefined}
              size="lg"
            />
            <div>
              <p className="text-sm text-slate-500">Linked student</p>
              <p className="font-semibold text-slate-900">
                {linkedStudent.display_name || linkedStudent.full_name}
              </p>
              <p className="text-xs text-slate-400">
                {linkedStudent.location || "Location not set"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Tuition requirements
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
                  title="No tuition requirements yet"
                  description="Create a tuition requirement for your child."
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

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Sent requests
              </h2>
              <Link
                href="/dashboard/requests?tab=sent"
                className="text-sm font-medium text-brand-700 hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="mt-2 divide-y divide-slate-100">
              {sentRows.length === 0 ? (
                <EmptyState
                  title="No requests sent yet"
                  description="Find a teacher and send a tuition request."
                />
              ) : (
                sentRows.map((row) => (
                  <RequestRow key={row.request.id} row={row} direction="sent" />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
