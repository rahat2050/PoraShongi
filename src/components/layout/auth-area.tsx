"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { buttonStyles } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string; role?: string };
}

export function AuthArea() {
  const configured = isSupabaseConfigured();
  const [loading, setLoading] = useState(configured);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (!configured) return;
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setUser((data.user as AuthUser | null) ?? null);
        setLoading(false);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser((session?.user as AuthUser | null) ?? null);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [configured]);

  if (loading) return <Skeleton className="h-9 w-28 rounded-full" />;

  if (user) {
    return (
      <div className="flex items-center gap-1.5">
        <Link href="/messages" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100" aria-label="মেসেজ">
          <MessageSquare className="h-5 w-5" aria-hidden />
        </Link>
        <Link href="/dashboard" className={buttonStyles({ variant: "primary", size: "sm" })}>
          Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/login" className={buttonStyles({ variant: "ghost", size: "sm" })}>
        লগইন
      </Link>
      <Link href="/register" className={buttonStyles({ variant: "primary", size: "sm" })}>
        শুরু করুন
      </Link>
    </div>
  );
}
