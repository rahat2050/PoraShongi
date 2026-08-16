"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, MessageSquare, ScrollText, User } from "lucide-react";
import { useSettings } from "@/lib/settings";

const items = [
  { href: "/", label: "হোম", labelEn: "Home", icon: Home, exact: true },
  { href: "/teachers", label: "খুঁজুন", labelEn: "Search", icon: Compass },
  { href: "/tuitions", label: "Tuition", labelEn: "Tuition", icon: ScrollText },
  { href: "/messages", label: "মেসেজ", labelEn: "Chat", icon: MessageSquare },
  { href: "/dashboard", label: "আমার", labelEn: "Mine", icon: User },
];

/** মোবাইলের জন্য bottom navigation bar — অ্যাপের মতো সহজ নেভিগেশন। */
export function BottomNav() {
  const pathname = usePathname();
  const { lang } = useSettings();

  const isActive = (item: (typeof items)[number]) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 md:hidden" aria-label="মোবাইল নেভিগেশন">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {items.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                active ? "text-brand-700 dark:text-brand-300" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <item.icon className="h-5 w-5" aria-hidden />
              {lang === "bn" ? item.label : item.labelEn}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
