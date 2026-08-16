"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { respondToRequest, withdrawRequest } from "@/features/requests/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function TeacherRequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function respond(decision: "accepted" | "rejected") {
    startTransition(async () => {
      const result = await respondToRequest(requestId, decision);
      if (result.ok) {
        toast(decision === "accepted" ? "অনুরোধ গ্রহণ করা হয়েছে" : "অনুরোধ প্রত্যাখ্যান করা হয়েছে", decision === "accepted" ? "success" : "danger");
        router.refresh();
      } else {
        toast(result.error, "danger");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50" disabled={pending} onClick={() => respond("accepted")}>
        <Check className="h-4 w-4" aria-hidden /> গ্রহণ
      </Button>
      <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" disabled={pending} onClick={() => respond("rejected")}>
        <X className="h-4 w-4" aria-hidden /> বাতিল
      </Button>
    </div>
  );
}

export function SenderRequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function withdraw() {
    startTransition(async () => {
      const result = await withdrawRequest(requestId);
      if (result.ok) {
        toast("অনুরোধ প্রত্যাহার করা হয়েছে", "success");
        router.refresh();
      } else {
        toast(result.error, "danger");
      }
    });
  }

  return (
    <Button size="sm" variant="ghost" disabled={pending} onClick={withdraw}>
      প্রত্যাহার
    </Button>
  );
}
