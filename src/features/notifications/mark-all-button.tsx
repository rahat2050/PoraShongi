"use client";

import { useTransition } from "react";
import { CheckCheck } from "lucide-react";
import { markAllNotificationsRead } from "@/features/notifications/actions";
import { Button } from "@/components/ui/button";

export function MarkAllReadButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(() => {
          void markAllNotificationsRead();
        });
      }}
    >
      <CheckCheck className="h-4 w-4" aria-hidden />
      সব পড়া হয়েছে
    </Button>
  );
}
