import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Heart, Plus, ScrollText, Send, Sparkles } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { getRoleProfileRow, computeProfileCompletion } from "@/lib/data/profiles";
import { listTuitionsFor } from "@/lib/data/tuitions";
import { listSentRequests, loadRequestDisplay } from "@/lib/data/requests";
import { listFavoriteIds } from "@/lib/data/favorites";
import { getPublicTeachers, matchTeachersForTuition } from "@/lib/data/teachers";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { ProfileCompletion } from "@/components/shared/profile-completion";
import { TuitionStatusBadge } from "@/components/shared/status-badge";
import { RequestRow } from "@/components/shared/request-row";
import { TeacherCard } from "@/components/shared/teacher-card";
import { MatchBadge } from "@/components/shared/match-badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Student dashboard" };

export default async function StudentDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "student") redirect("/dashboard");

  const roleProfileResult = await getRoleProfileRow(profile);
  const completion = computeProfileCompletion(profile, roleProfileResult.data);

  const [tuitions, sentRequests, favoriteIds] = await Promise.all([
    listTuitionsFor(profile.id),
    listSentRequests(profile.id),
    listFavoriteIds(profile.id),
  ]);

  const tuitionList = tuitions.data ?? [];
  const requestList = sentRequests.data ?? [];
  const favIds = favoriteIds.data ?? [];
  const savedTeachers =
    favIds.length > 0 ? ((await getPublicTeachers(favIds)).data ?? []) : [];

  const openTuition = tuitionList.find((t) => t.status === "open");
  const matches = openTuition
    ? await matchTeachersForTuition(openTuition.id, 4)
    : null;

  const pendingCount = requestList.filter((r) => r.status === "pending").length;
  const sentRows = await loadRequestDisplay(requestList.slice(0, 3), "sent");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student dashboard</h1>
          <p className="mt-1 text-slate-500">Manage your tuition requirements and requests.</p>
        </div>
        <Badge variant="brand">
          {ROLE_LABELS.student.en} · {ROLE_LABELS.student.bn}
        </Badge>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ProfileCompletion percent={completion.percent} missing={completion.missing} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
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
            href="/dashboard/requests"
          />
          <StatCard
            label="Saved teachers"
            value={savedTeachers.length}
            icon={<Heart className="h-5 w-5" aria-hidden />}
            href="/dashboard/favorites"
          />
          <StatCard
            label="Schedule"
            value="→"
            icon={<CalendarDays className="h-5 w-5" aria-hidden />}
            href="/dashboard/schedule"
            hrefLabel="Open schedule"
          />
        </div>
      </div>

      {openTuition && matches?.data && matches.data.results.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-600" aria-hidden />
              Recommended teachers for “{openTuition.title}”
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {matches.data.results.map((m) => {
                const name = m.display_name || m.full_name || "Teacher";
                return (
                  <Link
                    key={m.id}
                    href={`/teachers/${m.id}`}
                    className="rounded-2xl border border-slate-200 p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar src={m.avatar_url} name={name} size="md" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{name}</p>
                        <p className="truncate text-xs text-slate-500">
                          {m.experience_years != null ? `${m.experience_years} yr exp` : "New"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <MatchBadge score={m.score} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Recent tuition requirements</h2>
              <Link href="/dashboard/tuitions/new" className={buttonStyles({ variant: "primary", size: "sm" })}>
                <Plus className="h-4 w-4" aria-hidden />
                New tuition
              </Link>
            </div>
            <div className="mt-4 divide-y divide-slate-100">
              {tuitionList.length === 0 ? (
                <EmptyState title="No tuition requirements yet" description="Create your first tuition requirement to start finding teachers." />
              ) : (
                tuitionList.slice(0, 3).map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link href={`/dashboard/tuitions/${t.id}`} className="block truncate text-sm font-medium text-slate-800 hover:text-brand-700">
                        {t.title}
                      </Link>
                      <p className="text-xs text-slate-400">{t.class_level} · {t.subject}</p>
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
              <h2 className="text-base font-semibold text-slate-900">Recent sent requests</h2>
              <Link href="/dashboard/requests" className="text-sm font-medium text-brand-700 hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-2 divide-y divide-slate-100">
              {sentRows.length === 0 ? (
                <EmptyState title="No requests sent yet" description="Find a teacher and send your first tuition request." />
              ) : (
                sentRows.map((row) => <RequestRow key={row.request.id} row={row} direction="sent" />)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {savedTeachers.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Saved teachers</h2>
            <Link href="/dashboard/favorites" className="text-sm font-medium text-brand-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {savedTeachers.slice(0, 3).map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} canSave initiallySaved />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
