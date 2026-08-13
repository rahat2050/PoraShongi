"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { respondToRequest, withdrawRequest } from "@/features/requests/actions";
import { Button } from "@/components/ui/button";

export function TeacherRequestActions({ requestId }: { requestId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function respond(decision: "accepted" | "rejected") {
    startTransition(async () => {
      const result = await respondToRequest(requestId, decision);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <Button
        size="sm"
        variant="outline"
        className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
        disabled={pending}
        onClick={() => respond("accepted")}
      >
        <Check className="h-4 w-4" aria-hidden />
        Accept
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="border-red-300 text-red-600 hover:bg-red-50"
        disabled={pending}
        onClick={() => respond("rejected")}
      >
        <X className="h-4 w-4" aria-hidden />
        Reject
      </Button>
    </div>
  );
}

export function SenderRequestActions({ requestId }: { requestId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function withdraw() {
    startTransition(async () => {
      const result = await withdrawRequest(requestId);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <Button size="sm" variant="ghost" disabled={pending} onClick={withdraw}>
        Withdraw
      </Button>
    </div>
  );
}
