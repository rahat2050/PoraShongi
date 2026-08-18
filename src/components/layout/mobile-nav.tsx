"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Bookmark,
  BookOpen,
  CalendarDays,
  Compass,
  Heart,
  LayoutDashboard,
  LifeBuoy,
  LogIn,
  LogOut,
  MessageSquare,
  School,
  ScrollText,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
  UserRoundPlus,
  X,
  Menu,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { ROLE_LABELS, type UserRole } from "@/lib/auth/roles";
import { type AdminLevel } from "@/lib/auth/admin-access";

interface MobileSession {
  authenticated: boolean;
  user?: {
    id: string;
    email: string | null;
    name: string | null;
    role: string | null;
    adminLevel?: AdminLevel;
    accountStatus: string | null;
  };
}

const publicLinks = [
  { href: "/teachers", label: "শিক্ষক খুঁজুন", icon: Compass },
  { href: "/tuitions", label: "টিউশন খুঁজুন", icon: ScrollText },
  { href: "/leaderboard", label: "সেরা শিক্ষক", icon: Trophy },
  { href: "/blog", label: "শিক্ষা ব্লগ", icon: BookOpen },
  { href: "/coaching", label: "কোচিং সেন্টার", icon: School },
  { href: "/#how", label: "কীভাবে কাজ করে", icon: Sparkles },
  { href: "/safety", label: "নিরাপত্তা", icon: ShieldCheck },
  { href: "/contact", label: "সহায়তা", icon: LifeBuoy },
] as const;

const commonUserLinks = [
  { href: "/dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { href: "/messages", label: "মেসেজ", icon: MessageSquare },
  { href: "/dashboard/notifications", label: "নোটিফিকেশন", icon: Bell },
  { href: "/profile", label: "প্রোফাইল", icon: UserRound },
  { href: "/account", label: "সেটিংস", icon: Settings },
] as const;

export function MobileNav() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<MobileSession>({ authenticated: false });

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const controller = new AbortController();

    const loadSession = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/session", { cache: "no-store", signal: controller.signal });
        setSession((await response.json()) as MobileSession);
      } catch {
        if (!controller.signal.aborted) setSession({ authenticated: false });
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void loadSession();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      controller.abort();
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  async function signOut() {
    const response = await fetch("/api/session", { method: "POST" });
    if (!response.ok) {
      toast("লগ আউট করা যায়নি। আবার চেষ্টা করুন।", "danger");
      return;
    }
    setSession({ authenticated: false });
    setOpen(false);
    window.dispatchEvent(new Event("porasathi:auth-changed"));
    toast("লগ আউট হয়েছে", "info");
    router.replace("/");
    router.refresh();
  }

  const role = session.user?.role && session.user.role in ROLE_LABELS
    ? session.user.role as UserRole
    : null;
  const roleLinks = role === "teacher"
    ? [
        { href: "/tuitions", label: "টিউশন সুযোগ", icon: ScrollText },
        { href: "/dashboard/saved-tuitions", label: "সেভ করা টিউশন", icon: Bookmark },
        { href: "/dashboard/requests", label: "প্রাপ্ত অনুরোধ", icon: Send },
        { href: "/dashboard/schedule", label: "সময়সূচি", icon: CalendarDays },
      ]
    : role === "student" || role === "guardian"
      ? [
          { href: "/dashboard/tuitions", label: "আমার টিউশন", icon: ScrollText },
          { href: "/dashboard/requests", label: "পাঠানো অনুরোধ", icon: Send },
          { href: "/dashboard/favorites", label: "সেভ করা শিক্ষক", icon: Heart },
          { href: "/dashboard/schedule", label: "সময়সূচি", icon: CalendarDays },
        ]
      : [];

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label={open ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
        aria-expanded={open}
        aria-controls="mobile-navigation-panel"
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
      </button>

      {open && createPortal(
        <div id="mobile-navigation-panel" className="fixed inset-x-0 bottom-0 top-16 z-50 overflow-y-auto border-t border-slate-200 bg-slate-50 px-4 py-4 shadow-2xl dark:border-slate-700 dark:bg-slate-950">
          <div className="mx-auto max-w-md space-y-5 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            {loading ? (
              <div className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" aria-label="অ্যাকাউন্ট লোড হচ্ছে" />
            ) : session.authenticated && session.user ? (
              <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-4 dark:border-brand-800 dark:from-brand-950/50 dark:to-slate-900">
                <div className="flex items-center gap-3">
                  <Avatar name={session.user.name || session.user.email || "ব্যবহারকারী"} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900 dark:text-slate-100">{session.user.name || "ব্যবহারকারী"}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{session.user.email}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5 text-xs font-medium text-brand-800 dark:text-brand-300">
                      {role && <span>{ROLE_LABELS[role].bn}</span>}
                      {session.user.adminLevel === "super_admin" && <span>· সুপার অ্যাডমিন</span>}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <MenuLink href="/login" label="লগইন" icon={LogIn} prominent onNavigate={() => setOpen(false)} />
                <MenuLink href="/register" label="অ্যাকাউন্ট খুলুন" icon={UserRoundPlus} prominent onNavigate={() => setOpen(false)} />
              </div>
            )}

            {session.authenticated && session.user && (
              <section aria-labelledby="account-menu-heading">
                <h2 id="account-menu-heading" className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">আমার অ্যাকাউন্ট</h2>
                <div className="grid grid-cols-2 gap-2">
                  {commonUserLinks.map((item) => <MenuLink key={item.href} {...item} onNavigate={() => setOpen(false)} />)}
                  {roleLinks.map((item) => <MenuLink key={item.href} {...item} onNavigate={() => setOpen(false)} />)}
                  {session.user.adminLevel && (
                    <MenuLink
                      href="/admin"
                      label={session.user.adminLevel === "super_admin" ? "সুপার অ্যাডমিন" : "অ্যাডমিন প্যানেল"}
                      icon={ShieldCheck}
                      accent
                      onNavigate={() => setOpen(false)}
                    />
                  )}
                </div>
              </section>
            )}

            <section aria-labelledby="explore-menu-heading">
              <h2 id="explore-menu-heading" className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">এক্সপ্লোর</h2>
              <div className="grid grid-cols-2 gap-2">
                {publicLinks.map((item) => <MenuLink key={item.href} {...item} onNavigate={() => setOpen(false)} />)}
              </div>
            </section>

            {session.authenticated && (
              <button
                type="button"
                onClick={() => void signOut()}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70"
              >
                <LogOut className="h-4 w-4" aria-hidden /> লগ আউট
              </button>
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

function MenuLink({
  href,
  label,
  icon: Icon,
  prominent = false,
  accent = false,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  prominent?: boolean;
  accent?: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex min-h-12 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors ${
        prominent
          ? "border-brand-300 bg-brand-700 text-white hover:bg-brand-800 dark:border-brand-700 dark:bg-brand-700"
          : accent
            ? "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
            : "border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-600 dark:hover:text-brand-300"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span>{label}</span>
    </Link>
  );
}
