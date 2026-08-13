import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Inbox, Send } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import {
  listReceivedRequests,
  listSentRequests,
  loadRequestDisplay,
} from "@/lib/data/requests";
import { getRoleProfileRow } from "@/lib/data/profiles";
import { type GuardianProfile } from "@/types/index";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { RequestRow } from "@/components/shared/request-row";

export const metadata: Metadata = { title: "Tuition requests" };

export default async function RequestsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const isTeacher = profile.role === "teacher";
  // Teachers only receive; students/guardians only send.
  const direction: "sent" | "received" = isTeacher ? "received" : "sent";

  let linkedStudentId: string | null = null;
  if (profile.role === "guardian") {
    const gp = await getRoleProfileRow(profile);
    linkedStudentId = (gp.data as GuardianProfile | null)?.linked_student_id ?? null;
  }

  const rawRequests =
    direction === "received"
      ? await listReceivedRequests(profile.id)
      : await listSentRequests(profile.id, linkedStudentId);

  const requests = rawRequests.data ?? [];
  const rows = await loadRequestDisplay(requests, direction);

  const pending = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        {direction === "received" ? (
          <Inbox className="h-6 w-6 text-brand-600" aria-hidden />
        ) : (
          <Send className="h-6 w-6 text-brand-600" aria-hidden />
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {direction === "received" ? "Received requests" : "Sent requests"}
          </h1>
          <p className="mt-1 text-slate-500">
            {pending} pending · {requests.length} total
          </p>
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={direction === "received" ? <Inbox className="h-6 w-6" aria-hidden /> : <Send className="h-6 w-6" aria-hidden />}
                title={
                  direction === "received"
                    ? "No requests received yet"
                    : "No requests sent yet"
                }
                description={
                  direction === "received"
                    ? "Students will send you tuition requests once they find your profile."
                    : "Find a teacher and send your first tuition request."
                }
              />
            </div>
          ) : (
            rows.map((row) => (
              <RequestRow key={row.request.id} row={row} direction={direction} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
