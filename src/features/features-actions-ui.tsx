"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { joinBatch, leaveBatch, sendTrialRequest } from "@/features/features-actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function JoinBatchButton({
  tuitionId,
  seatsLeft,
  initiallyJoined,
}: {
  tuitionId: string;
  seatsLeft: number;
  initiallyJoined: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [joined, setJoined] = useState(initiallyJoined);
  const [pending, startTransition] = useTransition();

  function join() {
    startTransition(async () => {
      const result = await joinBatch(tuitionId);
      if (result.ok) {
        setJoined(true);
        toast("ব্যাচে যোগ দিয়েছেন!", "success");
        router.refresh();
      } else {
        toast(result.error, "danger");
      }
    });
  }

  function leave() {
    startTransition(async () => {
      const result = await leaveBatch(tuitionId);
      if (result.ok) {
        setJoined(false);
        toast("ব্যাচ থেকে বের হয়েছেন", "success");
        router.refresh();
      } else {
        toast(result.error, "danger");
      }
    });
  }

  if (joined) {
    return <Button variant="outline" disabled={pending} onClick={leave}>ব্যাচ থেকে বের হন</Button>;
  }
  if (seatsLeft <= 0) return <Button disabled>সিট পূর্ণ</Button>;

  return (
    <Button disabled={pending} onClick={join}>
      <Users className="h-4 w-4" aria-hidden />
      ব্যাচে যোগ দিন ({seatsLeft} সিট বাকি)
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
        toast("ট্রায়াল ক্লাসের অনুরোধ পাঠানো হয়েছে", "success");
        router.refresh();
      } else {
        toast(result.error, "danger");
      }
    });
  }

  return (
    <Button variant="outline" disabled={pending} onClick={request}>
      🎓 ট্রায়াল ক্লাস চাই{price != null && price > 0 ? ` (৳${price})` : " (ফ্রি)"}
    </Button>
  );
}
