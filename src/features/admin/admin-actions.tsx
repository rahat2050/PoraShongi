"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, ShieldBan, ShieldCheck, Trash2, X, XCircle } from "lucide-react";
import {
  adminDeleteTuition,
  adminSetAccountStatus,
  adminSetVerification,
} from "@/features/admin/actions";
import { type AccountStatus } from "@/types/index";
import { Button } from "@/components/ui/button";

export function AdminAccountStatusButton({
  userId,
  status,
}: {
  userId: string;
  status: AccountStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function set(next: "active" | "suspended" | "deleted") {
    setError(null);
    startTransition(async () => {
      const result = await adminSetAccountStatus(userId, next);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      {error && <span className="text-xs text-red-600">{error}</span>}
      {status === "active" && (
        <>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:bg-red-50"
            disabled={pending}
            onClick={() => set("suspended")}
          >
            <ShieldBan className="h-4 w-4" aria-hidden /> Suspend
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-700 hover:bg-red-50"
            disabled={pending}
            onClick={() => set("deleted")}
          >
            <XCircle className="h-4 w-4" aria-hidden /> Ban
          </Button>
        </>
      )}
      {(status === "suspended" || status === "pending") && (
        <Button
          size="sm"
          variant="outline"
          className="border-emerald-300 text-emerald-700"
          disabled={pending}
          onClick={() => set("active")}
        >
          <ShieldCheck className="h-4 w-4" aria-hidden />
          {status === "suspended" ? "Re-activate" : "Activate"}
        </Button>
      )}
      {status === "deleted" && (
        <Button
          size="sm"
          variant="outline"
          className="border-emerald-300 text-emerald-700"
          disabled={pending}
          onClick={() => set("active")}
        >
          <ShieldCheck className="h-4 w-4" aria-hidden /> Restore
        </Button>
      )}
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
