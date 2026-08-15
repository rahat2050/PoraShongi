"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2, X } from "lucide-react";
import { deleteSession, setAttendance, setSessionStatus } from "@/features/schedule/actions";
import { Button } from "@/components/ui/button";

export function TeacherSessionActions({
  sessionId,
  status,
}: {
  sessionId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean }>) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) router.refresh();
    });
  }

  if (status === "scheduled" || status === "rescheduled") {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setAttendance(sessionId, "present"))}>
          <Check className="h-4 w-4" aria-hidden /> উপস্থিত
        </Button>
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setAttendance(sessionId, "absent"))}>
          <X className="h-4 w-4" aria-hidden /> অনুপস্থিত
        </Button>
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => setSessionStatus(sessionId, "cancelled"))}>বাতিল</Button>
        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" disabled={pending} onClick={() => run(() => deleteSession(sessionId))}>
          <Trash2 className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" disabled={pending} onClick={() => run(() => deleteSession(sessionId))}>
        <Trash2 className="h-4 w-4" aria-hidden /> মুছুন
      </Button>
    );
  }

  return null;
}
