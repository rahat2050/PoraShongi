"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, MessageSquare, Settings, ShieldCheck, User as UserIcon } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { type AdminLevel } from "@/lib/auth/admin-access";

interface SessionSummary {
  authenticated: boolean;
  user?: {
    id: string;
    email: string | null;
    name: string | null;
    role: string | null;
    adminLevel?: AdminLevel;
    accountStatus: string | null;
  };
  unreadNotifications?: number;
}

export function AuthArea() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionSummary>({ authenticated: false });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        const response = await fetch("/api/session", { cache: "no-store" });
        const data = (await response.json()) as SessionSummary;
        if (active) setSession(data);
      } catch {
        if (active) setSession({ authenticated: false });
      } finally {
        if (active) setLoading(false);
      }
    };

    const refresh = () => void loadSession();
    void loadSession();
    window.addEventListener("porasathi:auth-changed", refresh);
    const timer = window.setInterval(loadSession, 60_000);

    return () => {
      active = false;
      window.removeEventListener("porasathi:auth-changed", refresh);
      window.clearInterval(timer);
    };
  }, []);

  if (loading) return <Skeleton className="h-11 w-28 rounded-full" />;

  if (session.authenticated && session.user) {
    return (
      <div className="flex items-center gap-1.5">
        <Link href="/messages" className="inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="মেসেজ">
          <MessageSquare className="h-5 w-5" aria-hidden />
        </Link>
        <Link
          href="/dashboard/notifications"
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label={session.unreadNotifications ? `${session.unreadNotifications}টি অপঠিত নোটিফিকেশন` : "নোটিফিকেশন"}
        >
          <Bell className="h-5 w-5" aria-hidden />
          {Boolean(session.unreadNotifications) && (
            <span className="absolute right-0 top-0 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {(session.unreadNotifications ?? 0) > 9 ? "9+" : session.unreadNotifications}
            </span>
          )}
        </Link>
        <UserMenu user={session.user} open={menuOpen} setOpen={setMenuOpen} onSignedOut={() => setSession({ authenticated: false })} />
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
  onSignedOut,
}: {
  user: NonNullable<SessionSummary["user"]>;
  open: boolean;
  setOpen: (value: boolean) => void;
  onSignedOut: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const name = user.name || user.email || "ব্যবহারকারী";

  async function signOut() {
    const response = await fetch("/api/session", { method: "POST" });
    if (!response.ok) {
      toast("লগ আউট করা যায়নি। আবার চেষ্টা করুন।", "danger");
      return;
    }
    onSignedOut();
    toast("লগ আউট হয়েছে", "info");
    setOpen(false);
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-full p-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="অ্যাকাউন্ট মেনু"
        aria-expanded={open}
        aria-controls="account-menu"
      >
        <Avatar name={name} size="sm" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div id="account-menu" className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-700">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{name}</p>
              {user.email && <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>}
            </div>
            <MenuItem icon={<UserIcon className="h-4 w-4" />} label="ড্যাশবোর্ড" onClick={() => { setOpen(false); router.push("/dashboard"); }} />
            {user.adminLevel && (
              <MenuItem
                icon={<ShieldCheck className="h-4 w-4" />}
                label={user.adminLevel === "super_admin" ? "সুপার অ্যাডমিন প্যানেল" : "অ্যাডমিন প্যানেল"}
                onClick={() => { setOpen(false); router.push("/admin"); }}
              />
            )}
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
      className={`flex min-h-11 w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
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
