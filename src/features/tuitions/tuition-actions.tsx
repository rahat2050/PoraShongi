"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Pause, Play, Trash2, XCircle } from "lucide-react";
import { deleteTuition, setTuitionStatus } from "@/features/tuitions/actions";
import { type TuitionStatus } from "@/types/index";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

export function TuitionManageActions({
  tuitionId,
  status,
}: {
  tuitionId: string;
  status: TuitionStatus;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; error?: string }>, successMsg: string) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast(successMsg, "success");
        router.refresh();
      } else {
        toast(result.error ?? "কিছু ভুল হয়েছে।", "danger");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "open" && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setTuitionStatus(tuitionId, "paused"), "Tuition pause হয়েছে")}>
          <Pause className="h-4 w-4" aria-hidden /> বিরতি
        </Button>
      )}
      {status === "paused" && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setTuitionStatus(tuitionId, "open"), "Tuition আবার চালু হয়েছে")}>
          <Play className="h-4 w-4" aria-hidden /> চালু করুন
        </Button>
      )}
      {status === "assigned" && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setTuitionStatus(tuitionId, "completed"), "Tuition সম্পন্ন হয়েছে")}>
          <CheckCircle2 className="h-4 w-4" aria-hidden /> সম্পন্ন
        </Button>
      )}
      {(status === "open" || status === "paused" || status === "assigned") && (
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => setTuitionStatus(tuitionId, "closed"), "Tuition বন্ধ হয়েছে")}>
          <XCircle className="h-4 w-4" aria-hidden /> বন্ধ
        </Button>
      )}
      <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" disabled={pending} onClick={() => setConfirmDelete(true)}>
        <Trash2 className="h-4 w-4" aria-hidden /> মুছুন
      </Button>

      <ConfirmDialog
        open={confirmDelete}
        title="Tuition মুছে ফেলবেন?"
        message="এটা মুছে গেলে আর ফেরত পাওয়া যাবে না।"
        loading={pending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          run(() => deleteTuition(tuitionId), "Tuition মুছে ফেলা হয়েছে");
          setConfirmDelete(false);
        }}
      />
    </div>
  );
}
