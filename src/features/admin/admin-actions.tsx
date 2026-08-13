"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, ShieldBan, ShieldCheck, Trash2, X } from "lucide-react";
import {
  adminDeleteTuition,
  adminSetAccountStatus,
  adminSetVerification,
} from "@/features/admin/actions";
import { Button } from "@/components/ui/button";

export function AdminAccountStatusButton({
  userId,
  suspended,
}: {
  userId: string;
  suspended: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    setError(null);
    startTransition(async () => {
      const result = await adminSetAccountStatus(userId, !suspended);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <Button
        size="sm"
        variant={suspended ? "outline" : "ghost"}
        className={
          suspended ? "border-emerald-300 text-emerald-700" : "text-red-600 hover:bg-red-50"
        }
        disabled={pending}
        onClick={toggle}
      >
        {suspended ? (
          <>
            <ShieldCheck className="h-4 w-4" aria-hidden /> Re-activate
          </>
        ) : (
          <>
            <ShieldBan className="h-4 w-4" aria-hidden /> Suspend
          </>
        )}
      </Button>
    </span>
  );
}

export function AdminVerifyButton({ teacherId }: { teacherId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function set(status: "verified" | "rejected") {
    setError(null);
    startTransition(async () => {
      const result = await adminSetVerification(teacherId, status);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <Button
        size="sm"
        variant="outline"
        className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
        disabled={pending}
        onClick={() => set("verified")}
      >
        <BadgeCheck className="h-4 w-4" aria-hidden /> Approve
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="text-red-600 hover:bg-red-50"
        disabled={pending}
        onClick={() => set("rejected")}
      >
        <X className="h-4 w-4" aria-hidden /> Reject
      </Button>
    </span>
  );
}

export function AdminDeleteTuitionButton({ tuitionId }: { tuitionId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await adminDeleteTuition(tuitionId);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <Button
        size="sm"
        variant="ghost"
        className="text-red-600 hover:bg-red-50"
        disabled={pending}
        onClick={remove}
      >
        <Trash2 className="h-4 w-4" aria-hidden /> Remove
      </Button>
    </span>
  );
}
