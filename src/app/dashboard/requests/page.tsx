import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Inbox, Send } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { listReceivedRequests, listSentRequests, loadRequestDisplay } from "@/lib/data/requests";
import { getRoleProfileRow } from "@/lib/data/profiles";
import { type GuardianProfile } from "@/types/index";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { RequestRow } from "@/components/shared/request-row";

export const metadata: Metadata = { title: "টিউশন অনুরোধ" };

export default async function RequestsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const isTeacher = profile.role === "teacher";
  const direction: "sent" | "received" = isTeacher ? "received" : "sent";

  let linkedStudentId: string | null = null;
  if (profile.role === "guardian") {
    const gp = await getRoleProfileRow(profile);
    linkedStudentId = (gp.data as GuardianProfile | null)?.linked_student_id ?? null;
  }

  const raw = direction === "received"
    ? await listReceivedRequests(profile.id)
    : await listSentRequests(profile.id, linkedStudentId);

  const requests = raw.data ?? [];
  const rows = await loadRequestDisplay(requests, direction);
  const pending = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        {direction === "received" ? <Inbox className="h-6 w-6 text-brand-600" aria-hidden /> : <Send className="h-6 w-6 text-brand-600" aria-hidden />}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {direction === "received" ? "প্রাপ্ত অনুরোধ" : "আমার পাঠানো অনুরোধ"}
          </h1>
          <p className="mt-1 text-slate-500">{pending} অপেক্ষমাণ · {requests.length} মোট</p>
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={direction === "received" ? <Inbox className="h-6 w-6" aria-hidden /> : <Send className="h-6 w-6" aria-hidden />}
                title={direction === "received" ? "কোনো অনুরোধ আসেনি" : "কোনো অনুরোধ পাঠানো হয়নি"}
                description={direction === "received" ? "শিক্ষার্থীরা অনুরোধ পাঠালে এখানে দেখাবে।" : "শিক্ষক খুঁজে অনুরোধ পাঠান।"}
              />
            </div>
          ) : (
            rows.map((row) => <RequestRow key={row.request.id} row={row} direction={direction} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
