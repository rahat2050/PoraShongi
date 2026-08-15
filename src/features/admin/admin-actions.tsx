"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, ShieldBan, ShieldCheck, X, XCircle } from "lucide-react";
import { adminResolveReport, adminSetAccountStatus, adminSetVerification } from "@/features/admin/actions";
import { type AccountStatus, type VerificationStatus } from "@/types/index";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function AdminVerifyButtons({ teacherId }: { teacherId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function set(status: VerificationStatus) {
    startTransition(async () => {
      const result = await adminSetVerification(teacherId, status);
      if (result.ok) {
        toast("ভেরিফিকেশন আপডেট হয়েছে", "success");
        router.refresh();
      } else {
        toast(result.error, "danger");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50" disabled={pending} onClick={() => set("verified")}>
        <BadgeCheck className="h-4 w-4" aria-hidden /> Verify
      </Button>
      <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" disabled={pending} onClick={() => set("rejected")}>
        <X className="h-4 w-4" aria-hidden /> বাতিল
      </Button>
    </div>
  );
}

export function AdminAccountButtons({ userId, status }: { userId: string; status: AccountStatus }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function set(next: "active" | "suspended" | "deleted") {
    startTransition(async () => {
      const result = await adminSetAccountStatus(userId, next);
      if (result.ok) {
        toast("অ্যাকাউন্ট স্ট্যাটাস আপডেট হয়েছে", "success");
        router.refresh();
      } else {
        toast(result.error, "danger");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {status === "active" && (
        <>
          <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" disabled={pending} onClick={() => set("suspended")}>
            <ShieldBan className="h-4 w-4" aria-hidden /> Suspend
          </Button>
          <Button size="sm" variant="ghost" className="text-red-700 hover:bg-red-50" disabled={pending} onClick={() => set("deleted")}>
            <XCircle className="h-4 w-4" aria-hidden /> Ban
          </Button>
        </>
      )}
      {(status === "suspended" || status === "pending" || status === "deleted") && (
        <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700" disabled={pending} onClick={() => set("active")}>
          <ShieldCheck className="h-4 w-4" aria-hidden /> চালু করুন
        </Button>
      )}
    </div>
  );
}

export function AdminReportButtons({ reportId }: { reportId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function act(status: "investigating" | "resolved" | "dismissed") {
    startTransition(async () => {
      const result = await adminResolveReport(reportId, status);
      if (result.ok) {
        toast("রিপোর্ট আপডেট হয়েছে", "success");
        router.refresh();
      } else {
        toast(result.error, "danger");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button size="sm" variant="outline" disabled={pending} onClick={() => act("investigating")}>তদন্ত</Button>
      <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700" disabled={pending} onClick={() => act("resolved")}>সমাধান</Button>
      <Button size="sm" variant="ghost" className="text-slate-500" disabled={pending} onClick={() => act("dismissed")}>খারিজ</Button>
    </div>
  );
}
