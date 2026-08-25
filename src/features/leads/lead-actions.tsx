"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, PhoneCall, Trash2, XCircle } from "lucide-react";
import { updateTutorLeadStatus } from "@/features/leads/actions";
import { type TutorLeadStatus } from "@/types/index";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function LeadStatusButtons({
  leadId,
  status,
}: {
  leadId: string;
  status: TutorLeadStatus;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function set(next: TutorLeadStatus) {
    startTransition(async () => {
      const result = await updateTutorLeadStatus(leadId, next);
      if (result.ok) {
        toast("লিড আপডেট হয়েছে", "success");
        router.refresh();
      } else {
        toast(result.error, "danger");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {status !== "contacted" && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => set("contacted")}>
          <PhoneCall className="h-4 w-4" aria-hidden /> যোগাযোগ হয়েছে
        </Button>
      )}
      {status !== "matched" && (
        <Button
          size="sm"
          variant="outline"
          className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300"
          disabled={pending}
          onClick={() => set("matched")}
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden /> শিক্ষক মিলেছে
        </Button>
      )}
      {status !== "closed" && (
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => set("closed")}>
          <XCircle className="h-4 w-4" aria-hidden /> বন্ধ
        </Button>
      )}
      {status !== "spam" && (
        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 dark:text-red-400" disabled={pending} onClick={() => set("spam")}>
          <Trash2 className="h-4 w-4" aria-hidden /> স্প্যাম
        </Button>
      )}
    </div>
  );
}
