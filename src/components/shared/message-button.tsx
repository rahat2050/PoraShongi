"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { startConversation } from "@/features/messages/actions";
import { Button } from "@/components/ui/button";

export function MessageButton({
  otherId,
  tuitionId,
  size = "md",
  variant = "outline",
}: {
  otherId: string;
  tuitionId?: string | null;
  size?: "sm" | "md";
  variant?: "outline" | "primary";
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await startConversation(otherId, tuitionId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/messages/${result.data.conversationId}`);
    });
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <Button size={size} variant={variant} disabled={pending} onClick={handleClick}>
        <MessageSquare className="h-4 w-4" aria-hidden />
        Message
      </Button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
