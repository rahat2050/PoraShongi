"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { joinBatch, sendTrialRequest } from "@/features/features-actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function JoinBatchButton({
  tuitionId,
  seatsLeft,
}: {
  tuitionId: string;
  seatsLeft: number;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function join() {
    startTransition(async () => {
      const result = await joinBatch(tuitionId);
      if (result.ok) {
        toast("Batch-এ join করেছেন!", "success");
        router.refresh();
      } else {
        toast(result.error, "danger");
      }
    });
  }

  if (seatsLeft <= 0) {
    return <Button disabled>সিট পূর্ণ</Button>;
  }

  return (
    <Button disabled={pending} onClick={join}>
      <Users className="h-4 w-4" aria-hidden />
      Batch-এ join করুন ({seatsLeft} সিট বাকি)
    </Button>
  );
}

export function TrialRequestButton({
  teacherId,
  price,
}: {
  teacherId: string;
  price: number | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function request() {
    startTransition(async () => {
      const result = await sendTrialRequest(teacherId);
      if (result.ok) {
        toast("Trial request পাঠানো হয়েছে", "success");
        router.refresh();
      } else {
        toast(result.error, "danger");
      }
    });
  }

  return (
    <Button variant="outline" disabled={pending} onClick={request}>
      🎓 Trial class request{price != null && price > 0 ? ` (৳${price})` : " (ফ্রি)"}
    </Button>
  );
}
