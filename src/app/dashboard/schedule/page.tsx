import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { listTuitionsFor } from "@/lib/data/tuitions";
import { listSessionsForTeacher, listSessionsByTuitions, loadSessionDisplay } from "@/lib/data/sessions";
import { getRoleProfileRow } from "@/lib/data/profiles";
import { type GuardianProfile, type Session } from "@/types/index";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SessionForm } from "@/features/schedule/session-form";
import { TeacherSessionActions } from "@/features/schedule/session-actions";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Schedule" };
export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<Session["status"], { label: string; variant: "success" | "warning" | "danger" | "info" | "default" }> = {
  scheduled: { label: "নির্ধারিত", variant: "info" },
  completed: { label: "সম্পন্ন", variant: "success" },
  cancelled: { label: "বাতিল", variant: "danger" },
  rescheduled: { label: "পুনর্নির্ধারিত", variant: "warning" },
};

export default async function SchedulePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const isTeacher = profile.role === "teacher";
  let sessions: Session[] = [];

  if (isTeacher) {
    sessions = (await listSessionsForTeacher(profile.id)).data ?? [];
  } else {
    let linkedStudentId: string | null = null;
    if (profile.role === "guardian") {
      const gp = await getRoleProfileRow(profile);
      linkedStudentId = (gp.data as GuardianProfile | null)?.linked_student_id ?? null;
    }
    const tuitions = (await listTuitionsFor(profile.id, linkedStudentId)).data ?? [];
    sessions = (await listSessionsByTuitions(tuitions.map((t) => t.id))).data ?? [];
  }

  const display = await loadSessionDisplay(sessions);
  const upcoming = display.filter((d) => d.session.status === "scheduled" || d.session.status === "rescheduled");
  const past = display.filter((d) => d.session.status === "completed" || d.session.status === "cancelled");

  const teacherTuitions = isTeacher ? (await listTuitionsFor(profile.id)).data ?? [] : [];
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
            <p className="mt-1 text-slate-500">{isTeacher ? "ক্লাস manage ও attendance দিন।" : "আপনার ক্লাসের সময়সূচি।"}</p>
          </div>
        </div>
        {isTeacher && <SessionForm tuitions={scheduleable} />}
      </div>

      <h2 className="mt-8 text-base font-semibold text-slate-900">আসন্ন ক্লাস</h2>
      <div className="mt-3 space-y-3">
        {upcoming.length === 0 ? (
          <Card><CardContent className="p-5 text-sm text-slate-400">কোনো আসন্ন ক্লাস নেই।</CardContent></Card>
        ) : (
          upcoming.map(({ session, tuitionTitle }) => (
            <SessionRow key={session.id} session={session} title={tuitionTitle ?? "Tuition"} isTeacher={isTeacher} />
          ))
        )}
      </div>

      <h2 className="mt-8 text-base font-semibold text-slate-900">অতীত ক্লাস</h2>
      <div className="mt-3 space-y-3">
        {past.length === 0 ? (
          <Card><CardContent className="p-5 text-sm text-slate-400">কোনো অতীত ক্লাস নেই।</CardContent></Card>
        ) : (
          past.map(({ session, tuitionTitle }) => (
            <SessionRow key={session.id} session={session} title={tuitionTitle ?? "Tuition"} isTeacher={isTeacher} />
          ))
        )}
      </div>

      {sessions.length === 0 && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <EmptyState icon={<CalendarDays className="h-6 w-6" aria-hidden />} title="কোনো ক্লাস schedule হয়নি" description={isTeacher ? "আপনার tuition-এর জন্য ক্লাস schedule করুন।" : "শিক্ষক ক্লাস schedule করলে এখানে দেখাবে।"} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SessionRow({ session, title, isTeacher }: { session: Session; title: string; isTeacher: boolean }) {
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
            {session.attendance && <Badge variant={session.attendance === "present" ? "success" : "danger"}>{session.attendance === "present" ? "উপস্থিত" : "অনুপস্থিত"}</Badge>}
          </div>
        </div>
        {isTeacher && <TeacherSessionActions sessionId={session.id} status={session.status} />}
      </CardContent>
    </Card>
  );
}
