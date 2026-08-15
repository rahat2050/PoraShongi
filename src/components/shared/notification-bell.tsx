"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";

/** Header-এর জন্য notification bell — unread count দেখায় (head:true, minimal data)। */
export function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      const id = data.user?.id;
      if (!id || !active) return;
      setUserId(id);

      const load = () =>
        supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", id)
          .eq("read", false)
          .then(({ count }) => {
            if (active) setUnread(count ?? 0);
          });

      load();
      // নতুন notification এলে হালকাভাবে refresh (realtime ছাড়া — data বাঁচাতে interval)
      const timer = setInterval(load, 60000);
      return () => clearInterval(timer);
    });

    return () => {
      active = false;
    };
  }, []);

  if (!userId) return null;

  return (
    <Link
      href="/dashboard/notifications"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
      aria-label={unread > 0 ? `${unread} টা অপঠিত নোটিফিকেশন` : "নোটিফিকেশন"}
    >
      <Bell className="h-5 w-5" aria-hidden />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
