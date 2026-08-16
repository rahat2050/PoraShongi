"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, MessageSquare, ScrollText, User } from "lucide-react";

const items = [
  { href: "/", label: "হোম", icon: Home, exact: true },
  { href: "/teachers", label: "খুঁজুন", icon: Compass },
  { href: "/tuitions", label: "টিউশন", icon: ScrollText },
  { href: "/messages", label: "মেসেজ", icon: MessageSquare },
  { href: "/dashboard", label: "আমার", icon: User },
];

/** মোবাইলের জন্য bottom navigation bar — অ্যাপের মতো সহজ নেভিগেশন। */
export function BottomNav() {
  const pathname = usePathname();

  const isActive = (item: (typeof items)[number]) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 md:hidden" aria-label="মোবাইল নেভিগেশন">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {items.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] font-medium transition-colors ${
                active ? "text-brand-700 dark:text-brand-300" : "text-slate-500 dark:text-slate-400"
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
