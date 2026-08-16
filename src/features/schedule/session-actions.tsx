"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2, X } from "lucide-react";
import { deleteSession, setAttendance, setSessionStatus } from "@/features/schedule/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function TeacherSessionActions({
  sessionId,
  status,
}: {
  sessionId: string;
  status: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; error?: string }>, successMessage: string) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast(successMessage, "success");
        router.refresh();
      } else {
        toast(result.error ?? "কাজটি সম্পন্ন করা যায়নি।", "danger");
      }
    });
  }

  if (status === "scheduled" || status === "rescheduled") {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setAttendance(sessionId, "present"), "উপস্থিতি সেভ হয়েছে")}>
          <Check className="h-4 w-4" aria-hidden /> উপস্থিত
        </Button>
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setAttendance(sessionId, "absent"), "অনুপস্থিতি সেভ হয়েছে")}>
          <X className="h-4 w-4" aria-hidden /> অনুপস্থিত
        </Button>
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => setSessionStatus(sessionId, "cancelled"), "ক্লাস বাতিল হয়েছে")}>বাতিল</Button>
        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" disabled={pending} onClick={() => run(() => deleteSession(sessionId), "ক্লাস মুছে ফেলা হয়েছে")}>
          <Trash2 className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" disabled={pending} onClick={() => run(() => deleteSession(sessionId), "ক্লাস মুছে ফেলা হয়েছে")}>
        <Trash2 className="h-4 w-4" aria-hidden /> মুছুন
      </Button>
    );
  }

  return null;
}
