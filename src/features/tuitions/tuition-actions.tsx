"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Pause, Play, Trash2, XCircle } from "lucide-react";
import { deleteTuition, setTuitionStatus } from "@/features/tuitions/actions";
import { type TuitionStatus } from "@/types/index";
import { Button } from "@/components/ui/button";

export function TuitionManageActions({
  tuitionId,
  status,
}: {
  tuitionId: string;
  status: TuitionStatus;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error ?? "কিছু ভুল হয়েছে।");
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {error && <span className="text-xs text-red-600">{error}</span>}
      {status === "open" && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setTuitionStatus(tuitionId, "paused"))}>
          <Pause className="h-4 w-4" aria-hidden /> বিরতি
        </Button>
      )}
      {status === "paused" && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setTuitionStatus(tuitionId, "open"))}>
          <Play className="h-4 w-4" aria-hidden /> চালু করুন
        </Button>
      )}
      {status === "assigned" && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setTuitionStatus(tuitionId, "completed"))}>
          <CheckCircle2 className="h-4 w-4" aria-hidden /> সম্পন্ন
        </Button>
      )}
      {(status === "open" || status === "paused" || status === "assigned") && (
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => setTuitionStatus(tuitionId, "closed"))}>
          <XCircle className="h-4 w-4" aria-hidden /> বন্ধ
        </Button>
      )}
      <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" disabled={pending} onClick={() => run(() => deleteTuition(tuitionId))}>
        <Trash2 className="h-4 w-4" aria-hidden /> মুছুন
      </Button>
    </div>
  );
}
