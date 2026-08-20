"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markNotificationRead } from "@/features/notifications/actions";
import { cn, formatDateTime } from "@/lib/utils";
import { type AppNotification } from "@/types/index";

export function NotificationItem({
  notification,
  bordered = true,
}: {
  notification: AppNotification;
  /** List-item animation wrappers move the divider to the wrapper. */
  bordered?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function open() {
    startTransition(async () => {
      await markNotificationRead(notification.id);
      if (notification.link) router.push(notification.link);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={open}
      disabled={pending}
      className={cn(
        "flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-slate-50",
        bordered && "border-b border-slate-100 last:border-0",
        !notification.read && "bg-brand-50/50",
      )}
    >
      <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", notification.read ? "bg-slate-200" : "bg-brand-500")} aria-hidden />
      <span className="min-w-0 flex-1">
        <span className={cn("block text-sm", notification.read ? "font-medium text-slate-600" : "font-semibold text-slate-900")}>
          {notification.title}
        </span>
        {notification.body && <span className="mt-0.5 block text-xs text-slate-500">{notification.body}</span>}
        <span className="mt-1 block text-xs text-slate-400">{formatDateTime(notification.created_at)}</span>
      </span>
    </button>
  );
}
