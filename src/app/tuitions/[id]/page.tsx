import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MapPin, User, Wallet } from "lucide-react";
import { getPublicTuition } from "@/lib/data/tuitions";
import { getCurrentUser, getCurrentProfile } from "@/lib/auth/server-auth";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupRequired } from "@/components/shared/setup-required";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { TuitionStatusBadge } from "@/components/shared/status-badge";
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
        <p className="mt-2 text-slate-500">
          Sign in to view tuition requirements.
        </p>
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

  const posterName =
    tuition.poster_display_name || tuition.poster_name || "Member";

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
              {tuition.title}
            </h1>
            <TuitionStatusBadge status={tuition.status} />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge variant="brand">{tuition.class_level}</Badge>
            <Badge variant="accent">{tuition.subject}</Badge>
            <Badge variant="outline">{modeLabel(tuition.teaching_mode)}</Badge>
          </div>

          <dl className="mt-6 space-y-3 text-sm text-slate-700">
            {tuition.location && (
              <Row
                icon={<MapPin className="h-4 w-4" />}
                label="Location"
                value={tuition.location}
              />
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
              <h2 className="text-sm font-semibold text-slate-800">
                Requirements
              </h2>
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
                <p className="text-xs text-slate-400">
                  Posted {formatDate(tuition.created_at)}
                </p>
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
