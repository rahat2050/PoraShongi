import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { listTuitionsFor, getTuitionsByIds } from "@/lib/data/tuitions";
import { listSessionsForUser, listSessionsByTuitions } from "@/lib/data/sessions";
import { getRoleProfileRow } from "@/lib/data/profiles";
import { type GuardianProfile, type Session } from "@/types/index";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SessionForm } from "@/features/schedule/session-form";
import { TeacherSessionActions } from "@/features/schedule/session-actions";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Schedule" };

const STATUS_BADGE: Record<Session["status"], { label: string; variant: "success" | "warning" | "danger" | "info" | "default" }> = {
  scheduled: { label: "Scheduled", variant: "info" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "danger" },
  rescheduled: { label: "Rescheduled", variant: "warning" },
};

export default async function SchedulePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const isTeacher = profile.role === "teacher";

  let sessions: Session[] = [];
  let tuitionMap = new Map<string, string>();

  if (isTeacher) {
    const res = await listSessionsForUser(profile.id);
    sessions = res.data ?? [];
  } else {
    let linkedStudentId: string | null = null;
    if (profile.role === "guardian") {
      const gp = await getRoleProfileRow(profile);
      linkedStudentId = (gp.data as GuardianProfile | null)?.linked_student_id ?? null;
    }
    const tuitionsRes = await listTuitionsFor(profile.id, linkedStudentId);
    const tuitionIds = (tuitionsRes.data ?? []).map((t) => t.id);
    const sessionsRes = await listSessionsByTuitions(tuitionIds);
    sessions = sessionsRes.data ?? [];
  }

  if (sessions.length > 0) {
    const ids = Array.from(new Set(sessions.map((s) => s.tuition_id)));
    const tuitions = (await getTuitionsByIds(ids)).data ?? [];
    tuitionMap = new Map(tuitions.map((t) => [t.id, t.title]));
  }

  const upcoming = sessions.filter((s) => s.status === "scheduled" || s.status === "rescheduled");
  const past = sessions.filter((s) => s.status === "completed" || s.status === "cancelled");

  const teacherTuitions = isTeacher
    ? (await listTuitionsFor(profile.id)).data ?? []
    : [];
  const scheduleable = teacherTuitions
    .filter((t) => t.status === "open" || t.status === "assigned")
    .map((t) => ({ id: t.id, title: t.title }));

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-6 w-6 text-brand-600" aria-hidden />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Schedule</h1>
            <p className="mt-1 text-slate-500">
              {isTeacher ? "Manage your tuition classes and attendance." : "Your tuition schedule."}
            </p>
          </div>
        </div>
        {isTeacher && <SessionForm tuitions={scheduleable} />}
      </div>

      <h2 className="mt-8 text-base font-semibold text-slate-900">Upcoming</h2>
      <div className="mt-3 space-y-3">
        {upcoming.length === 0 ? (
          <Card>
            <CardContent className="p-5 text-sm text-slate-400">No upcoming classes.</CardContent>
          </Card>
        ) : (
          upcoming.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              title={tuitionMap.get(session.tuition_id) ?? "Tuition"}
              isTeacher={isTeacher}
            />
          ))
        )}
      </div>

      <h2 className="mt-8 text-base font-semibold text-slate-900">Past</h2>
      <div className="mt-3 space-y-3">
        {past.length === 0 ? (
          <Card>
            <CardContent className="p-5 text-sm text-slate-400">No past classes yet.</CardContent>
          </Card>
        ) : (
          past.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              title={tuitionMap.get(session.tuition_id) ?? "Tuition"}
              isTeacher={isTeacher}
            />
          ))
        )}
      </div>

      {sessions.length === 0 && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <EmptyState
              icon={<CalendarDays className="h-6 w-6" aria-hidden />}
              title="No classes scheduled yet"
              description={
                isTeacher
                  ? "Schedule your first class once a tuition is assigned to you."
                  : "Classes will appear here once your teacher schedules them."
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SessionRow({
  session,
  title,
  isTeacher,
}: {
  session: Session;
  title: string;
  isTeacher: boolean;
}) {
  const cfg = STATUS_BADGE[session.status];
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="mt-0.5 text-sm text-slate-500">{formatDateTime(session.scheduled_at)}</p>
          {session.notes && <p className="mt-0.5 text-xs text-slate-400">{session.notes}</p>}
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
            {session.attendance && (
              <Badge variant={session.attendance === "present" ? "success" : "danger"}>
                {session.attendance === "present" ? "Present" : "Absent"}
              </Badge>
            )}
          </div>
        </div>
        {isTeacher && <TeacherSessionActions sessionId={session.id} status={session.status} />}
      </CardContent>
    </Card>
  );
}
