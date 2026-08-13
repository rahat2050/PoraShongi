import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MapPin, Sparkles, User, Wallet } from "lucide-react";
import { getPublicTuition } from "@/lib/data/tuitions";
import { matchTeachersForTuition } from "@/lib/data/teachers";
import { getCurrentUser, getCurrentProfile } from "@/lib/auth/server-auth";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupRequired } from "@/components/shared/setup-required";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { TuitionStatusBadge } from "@/components/shared/status-badge";
import { MatchBadge } from "@/components/shared/match-badge";
import { WatchButton } from "@/components/shared/watch-button";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonStyles } from "@/components/ui/button";
import { formatDate, formatTaka, modeLabel } from "@/lib/utils";

export const metadata: Metadata = { title: "Tuition requirement" };

export default async function TuitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseConfigured()) return <SetupRequired />;

  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-slate-900">Sign in required</h1>
        <p className="mt-2 text-slate-500">Sign in to view tuition requirements.</p>
        <Link href={`/login?next=/tuitions/${id}`} className={buttonStyles({ className: "mt-6" })}>
          Sign in
        </Link>
      </div>
    );
  }

  const result = await getPublicTuition(id);
  const tuition = result.data ?? null;
  if (!tuition) notFound();

  const profile = await getCurrentProfile();
  const isOwner = profile?.id === tuition.poster_id;

  let matches: { total: number; results: import("@/types/index").TeacherMatch[] } | null = null;
  if (isOwner && profile) {
    const matchResult = await matchTeachersForTuition(tuition.id, 6);
    if (matchResult.data) matches = matchResult.data;
  }

  const posterName = tuition.poster_display_name || tuition.poster_name || "Member";

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{tuition.title}</h1>
            <TuitionStatusBadge status={tuition.status} />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge variant="brand">{tuition.class_level}</Badge>
            <Badge variant="accent">{tuition.subject}</Badge>
            <Badge variant="outline">{modeLabel(tuition.teaching_mode)}</Badge>
          </div>

          <dl className="mt-6 space-y-3 text-sm text-slate-700">
            {tuition.location && (
              <Row icon={<MapPin className="h-4 w-4" />} label="Location" value={tuition.location} />
            )}
            <Row
              icon={<Wallet className="h-4 w-4" />}
              label="Budget"
              value={`${formatTaka(tuition.budget)}${tuition.budget_negotiable ? " (negotiable)" : ""}`}
            />
            <Row
              icon={<CalendarDays className="h-4 w-4" />}
              label="Preferred days"
              value={tuition.preferred_days?.length ? tuition.preferred_days.join(", ") : "Flexible"}
            />
            <Row
              icon={<Clock className="h-4 w-4" />}
              label="Preferred time"
              value={tuition.preferred_time || "Flexible"}
            />
          </dl>

          {tuition.requirements && (
            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <h2 className="text-sm font-semibold text-slate-800">Requirements</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {tuition.requirements}
              </p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
            <div className="flex items-center gap-3">
              <Avatar src={tuition.poster_avatar} name={posterName} size="sm" />
              <div>
                <p className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                  <User className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                  {posterName}
                </p>
                <p className="text-xs text-slate-400">Posted {formatDate(tuition.created_at)}</p>
              </div>
            </div>
            {isOwner && (
              <Link
                href={`/dashboard/tuitions/${tuition.id}`}
                className={buttonStyles({ variant: "outline", size: "sm" })}
              >
                Manage
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {isOwner && matches && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-600" aria-hidden />
              Matching teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {matches.total === 0 ? (
              <EmptyState
                title="No suitable teacher found right now"
                description="We'll notify you as soon as a matching teacher joins."
                action={
                  <WatchButton
                    tuitionId={tuition.id}
                    classLevel={tuition.class_level}
                    subject={tuition.subject}
                    location={tuition.location ?? undefined}
                    teachingMode={tuition.teaching_mode}
                    budget={tuition.budget}
                  />
                }
              />
            ) : (
              <div className="space-y-3">
                {matches.results.map((m) => {
                  const name = m.display_name || m.full_name || "Teacher";
                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 p-4"
                    >
                      <Avatar src={m.avatar_url} name={name} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{name}</p>
                        <p className="truncate text-xs text-slate-500">
                          {m.subjects?.slice(0, 3).join(", ") || m.headline || "Teacher"}
                        </p>
                      </div>
                      <MatchBadge score={m.score} />
                      <Link
                        href={`/teachers/${m.id}`}
                        className="text-sm font-medium text-brand-700 hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-slate-400">{icon}</span>
      <span className="w-32 shrink-0 text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
