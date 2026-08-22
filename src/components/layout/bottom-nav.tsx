"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Compass, Home, MessageSquare, ScrollText, User } from "lucide-react";

type BottomNavItem = {
  href: string;
  label: string;
  icon: typeof Home;
  exact?: boolean;
  matchPrefixes?: string[];
};

const defaultItems: BottomNavItem[] = [
  { href: "/", label: "হোম", icon: Home, exact: true },
  { href: "/teachers", label: "খুঁজুন", icon: Compass },
  { href: "/tuitions", label: "টিউশন", icon: ScrollText },
  { href: "/messages", label: "মেসেজ", icon: MessageSquare },
  { href: "/dashboard", label: "আমার", icon: User, matchPrefixes: ["/dashboard", "/profile", "/account"] },
];

const teacherItems: BottomNavItem[] = [
  { href: "/", label: "হোম", icon: Home, exact: true },
  { href: "/tuitions", label: "টিউশন", icon: ScrollText },
  { href: "/dashboard/saved-tuitions", label: "সেভড", icon: Bookmark },
  { href: "/messages", label: "মেসেজ", icon: MessageSquare },
  { href: "/dashboard", label: "আমার", icon: User, exact: true, matchPrefixes: ["/profile", "/account"] },
];

/** Mobile app-style navigation; teachers receive a dedicated Saved shortcut. */
export function BottomNav() {
  const pathname = usePathname();
  const [teacher, setTeacher] = useState(false);

  useEffect(() => {
    let active = true;
    const loadRole = async () => {
      try {
        const response = await fetch("/api/session", { cache: "no-store" });
        const session = await response.json() as { authenticated?: boolean; user?: { role?: string | null } };
        if (active) setTeacher(Boolean(session.authenticated && session.user?.role === "teacher"));
      } catch {
        if (active) setTeacher(false);
      }
    };
    const refresh = () => void loadRole();
    void loadRole();
    window.addEventListener("porasathi:auth-changed", refresh);
    return () => {
      active = false;
      window.removeEventListener("porasathi:auth-changed", refresh);
    };
  }, []);

  const items = teacher ? teacherItems : defaultItems;
  const isActive = (item: BottomNavItem) => {
    if (item.exact && pathname === item.href) return true;
    if (item.matchPrefixes?.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return true;
    if (item.exact) return false;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-slate-700 dark:bg-slate-900 md:hidden" aria-label="মোবাইল নেভিগেশন">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {items.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] font-medium transition-colors ${
                active ? "text-brand-700 dark:text-brand-300" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <item.icon className="h-5 w-5" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
