"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Eye, EyeOff, ShieldCheck, Trash2 } from "lucide-react";
import {
  adminModerateReview,
  adminResolveReport,
  adminSetVerificationFlags,
} from "@/features/admin/actions";
import { type Profile } from "@/types/index";
import { Button } from "@/components/ui/button";

export function AdminTierButtons({ teacher }: { teacher: Profile }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function setFlags(flags: {
    phoneVerified?: boolean;
    educationVerified?: boolean;
    identityVerified?: boolean;
    trusted?: boolean;
  }) {
    setError(null);
    startTransition(async () => {
      const result = await adminSetVerificationFlags(teacher.id, flags);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <Toggle
        active={teacher.phone_verified}
        disabled={pending}
        label="Phone"
        onClick={() => setFlags({ phoneVerified: !teacher.phone_verified })}
      />
      <Toggle
        active={teacher.education_verified}
        disabled={pending}
        label="Education"
        onClick={() => setFlags({ educationVerified: !teacher.education_verified })}
      />
      <Toggle
        active={teacher.identity_verified}
        disabled={pending}
        label="Identity"
        onClick={() => setFlags({ identityVerified: !teacher.identity_verified })}
      />
      <Toggle
        active={teacher.trusted_tutor}
        disabled={pending}
        label="Trusted"
        onClick={() => setFlags({ trusted: !teacher.trusted_tutor })}
      />
    </div>
  );
}

function Toggle({
  active,
  label,
  onClick,
  disabled,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      size="sm"
      variant={active ? "secondary" : "outline"}
      disabled={disabled}
      onClick={onClick}
      className={active ? "" : "text-slate-600"}
    >
      {active && <BadgeCheck className="h-4 w-4" aria-hidden />}
      {label}
    </Button>
  );
}

export function AdminReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function act(status: "investigating" | "resolved" | "dismissed") {
    setError(null);
    startTransition(async () => {
      const result = await adminResolveReport(reportId, status);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <Button size="sm" variant="outline" disabled={pending} onClick={() => act("investigating")}>
        <ShieldCheck className="h-4 w-4" aria-hidden /> Investigate
      </Button>
      <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700" disabled={pending} onClick={() => act("resolved")}>
        Resolve
      </Button>
      <Button size="sm" variant="ghost" className="text-slate-500" disabled={pending} onClick={() => act("dismissed")}>
        Dismiss
      </Button>
    </div>
  );
}

export function AdminReviewActions({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function act(action: "hide" | "publish" | "remove") {
    setError(null);
    startTransition(async () => {
      const result = await adminModerateReview(reviewId, action);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <Button size="sm" variant="outline" disabled={pending} onClick={() => act("hide")}>
        <EyeOff className="h-4 w-4" aria-hidden /> Hide
      </Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => act("publish")}>
        <Eye className="h-4 w-4" aria-hidden /> Publish
      </Button>
      <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" disabled={pending} onClick={() => act("remove")}>
        <Trash2 className="h-4 w-4" aria-hidden /> Remove
      </Button>
    </div>
  );
}
