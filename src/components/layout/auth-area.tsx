"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, MessageSquare, Settings, User as UserIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { buttonStyles } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/shared/notification-bell";
import { useToast } from "@/components/ui/toast";

interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string; role?: string };
}

export function AuthArea() {
  const configured = isSupabaseConfigured();
  const [loading, setLoading] = useState(configured);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
        <Link href="/messages" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="মেসেজ">
          <MessageSquare className="h-5 w-5" aria-hidden />
        </Link>
        <NotificationBell />
        <UserMenu user={user} open={menuOpen} setOpen={setMenuOpen} />
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

function UserMenu({
  user,
  open,
  setOpen,
}: {
  user: AuthUser;
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const name = user.user_metadata?.full_name || user.email || "User";

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast("লগ আউট হয়েছে", "info");
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="অ্যাকাউন্ট মেনু"
        aria-expanded={open}
      >
        <Avatar name={name} size="sm" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-700">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{name}</p>
              {user.email && <p className="truncate text-xs text-slate-400">{user.email}</p>}
            </div>
            <MenuItem icon={<UserIcon className="h-4 w-4" />} label="ড্যাশবোর্ড" onClick={() => { setOpen(false); router.push("/dashboard"); }} />
            <MenuItem icon={<Settings className="h-4 w-4" />} label="প্রোফাইল ও সেটিংস" onClick={() => { setOpen(false); router.push("/profile"); }} />
            <MenuItem icon={<Settings className="h-4 w-4" />} label="অ্যাকাউন্ট" onClick={() => { setOpen(false); router.push("/account"); }} />
            <div className="my-1 h-px bg-slate-100 dark:bg-slate-700" />
            <MenuItem icon={<LogOut className="h-4 w-4" />} label="লগ আউট" danger onClick={() => void signOut()} />
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
        danger
          ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-slate-700"
          : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
