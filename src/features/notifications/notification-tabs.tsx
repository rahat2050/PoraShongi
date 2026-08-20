"use client";

import { useState } from "react";
import { type AppNotification } from "@/types/index";
import { NotificationItem } from "@/features/notifications/notification-item";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "all", label: "সব" },
  { key: "request", label: "Request" },
  { key: "message", label: "মেসেজ" },
  { key: "review", label: "রিভিউ" },
  { key: "verification", label: "ভেরিফিকেশন" },
  { key: "other", label: "অন্যান্য" },
] as const;

function categorize(n: AppNotification): string {
  if (n.type === "new_request" || n.type === "request_accepted" || n.type === "request_rejected" || n.type === "contact_request" || n.type === "contact_accepted" || n.type === "contact_rejected") return "request";
  if (n.type === "new_message") return "message";
  if (n.type === "review_received") return "review";
  if (n.type === "verification_update") return "verification";
  return "other";
}

/** Notification-এ ট্যাব — ধরন ধরে ফিল্টার। সব client-side, কোনো ডাটা লাগে না। */
export function NotificationTabs({ notifications }: { notifications: AppNotification[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");

  const filtered = tab === "all" ? notifications : notifications.filter((n) => categorize(n) === tab);

  return (
    <div>
      <div className="flex gap-1.5 overflow-x-auto px-1 pb-1" aria-label="নোটিফিকেশন ফিল্টার">
        {TABS.map((t) => {
          const count = t.key === "all" ? notifications.length : notifications.filter((n) => categorize(n) === t.key).length;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                tab === t.key
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-slate-300 bg-white text-slate-600 hover:border-brand-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300",
              )}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="mt-2">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">এই ধরনের কোনো নোটিফিকেশন নেই।</p>
        ) : (
          filtered.map((n, index) => (
            <Reveal key={n.id} delay={Math.min(index * 40, 240)} className="border-b border-slate-100 last:border-0 dark:border-slate-700">
              <NotificationItem notification={n} bordered={false} />
            </Reveal>
          ))
        )}
      </div>
    </div>
  );
}
