"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { respondTrialRequest } from "@/features/features-actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function TrialRequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function respond(decision: "accepted" | "rejected") {
    startTransition(async () => {
      const result = await respondTrialRequest(requestId, decision);
      if (result.ok) {
        toast(decision === "accepted" ? "ট্রায়াল মঞ্জুর" : "ট্রায়াল বাতিল", decision === "accepted" ? "success" : "danger");
        router.refresh();
      } else {
        toast(result.error, "danger");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50" disabled={pending} onClick={() => respond("accepted")}>
        <Check className="h-4 w-4" aria-hidden /> মঞ্জুর
      </Button>
      <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" disabled={pending} onClick={() => respond("rejected")}>
        <X className="h-4 w-4" aria-hidden /> বাতিল
      </Button>
    </div>
  );
}
