"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, ShieldBan, ShieldCheck, X, XCircle } from "lucide-react";
import { adminResolveReport, adminSetAccountStatus, adminSetPremium, adminSetVerification } from "@/features/admin/actions";
import { type AccountStatus, type VerificationStatus } from "@/types/index";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
        <BadgeCheck className="h-4 w-4" aria-hidden /> যাচাই করুন
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
  const [confirmStatus, setConfirmStatus] = useState<"suspended" | "deleted" | null>(null);

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
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        {status === "active" && (
          <>
            <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" disabled={pending} onClick={() => setConfirmStatus("suspended")}>
              <ShieldBan className="h-4 w-4" aria-hidden /> স্থগিত
            </Button>
            <Button size="sm" variant="ghost" className="text-red-700 hover:bg-red-50" disabled={pending} onClick={() => setConfirmStatus("deleted")}>
              <XCircle className="h-4 w-4" aria-hidden /> নিষিদ্ধ
            </Button>
          </>
        )}
        {(status === "suspended" || status === "pending" || status === "deleted") && (
          <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700" disabled={pending} onClick={() => set("active")}>
            <ShieldCheck className="h-4 w-4" aria-hidden /> চালু করুন
          </Button>
        )}
      </div>
      <ConfirmDialog
        open={confirmStatus !== null}
        title={confirmStatus === "deleted" ? "অ্যাকাউন্ট নিষিদ্ধ করবেন?" : "অ্যাকাউন্ট স্থগিত করবেন?"}
        message={confirmStatus === "deleted"
          ? "ব্যবহারকারী লগইন অবস্থায় থাকলেও সুরক্ষিত ফিচার ব্যবহার করতে পারবেন না এবং প্রোফাইল প্রকাশিত থাকবে না।"
          : "পর্যালোচনা শেষ না হওয়া পর্যন্ত ব্যবহারকারী সুরক্ষিত ফিচার ব্যবহার করতে পারবেন না।"}
        confirmLabel={confirmStatus === "deleted" ? "নিষিদ্ধ করুন" : "স্থগিত করুন"}
        loading={pending}
        onCancel={() => setConfirmStatus(null)}
        onConfirm={() => {
          if (confirmStatus) set(confirmStatus);
          setConfirmStatus(null);
        }}
      />
    </>
  );
}

export function AdminPremiumToggle({ teacherId, premium }: { teacherId: string; premium: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const result = await adminSetPremium(teacherId, !premium);
      if (result.ok) {
        toast(premium ? "প্রিমিয়াম বন্ধ হয়েছে" : "প্রিমিয়াম চালু হয়েছে", "success");
        router.refresh();
      } else {
        toast(result.error, "danger");
      }
    });
  }

  return (
    <Button
      size="sm"
      variant={premium ? "secondary" : "outline"}
      disabled={pending}
      onClick={toggle}
    >
      {premium ? "★ প্রিমিয়াম (বন্ধ করুন)" : "প্রিমিয়াম করুন"}
    </Button>
  );
}

export function AdminReportButtons({ reportId, status }: { reportId: string; status: "open" | "investigating" | "resolved" | "dismissed" }) {
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

  if (status === "resolved" || status === "dismissed") return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {status === "open" && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => act("investigating")}>তদন্ত শুরু</Button>
      )}
      <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700" disabled={pending} onClick={() => act("resolved")}>সমাধান</Button>
      <Button size="sm" variant="ghost" className="text-slate-500" disabled={pending} onClick={() => act("dismissed")}>খারিজ</Button>
    </div>
  );
}
