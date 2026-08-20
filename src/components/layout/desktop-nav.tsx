"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Compass, ScrollText, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/teachers", label: "শিক্ষক খুঁজুন", shortLabel: "শিক্ষক", icon: Compass },
  { href: "/tuitions", label: "টিউশন খুঁজুন", shortLabel: "টিউশন", icon: ScrollText },
  { href: "/leaderboard", label: "সেরা শিক্ষক", shortLabel: "সেরা", icon: Trophy },
  { href: "/resources", label: "শিক্ষা রিসোর্স", shortLabel: "রিসোর্স", icon: BookOpen },
  { href: "/#how", label: "কীভাবে কাজ করে", shortLabel: "কীভাবে", icon: Sparkles, homeAnchor: true },
  { href: "/safety", label: "নিরাপত্তা", shortLabel: "নিরাপত্তা", icon: ShieldCheck },
] as const;

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav
      className="hidden items-center gap-1 rounded-2xl border border-slate-200/80 bg-slate-100/80 p-1 shadow-inner shadow-slate-900/5 backdrop-blur md:flex dark:border-slate-700 dark:bg-slate-800/80"
      aria-label="প্রধান নেভিগেশন"
    >
      {items.map((item) => {
        const active = !("homeAnchor" in item) && (pathname === item.href || pathname.startsWith(`${item.href}/`));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group inline-flex h-11 w-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-px active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 xl:w-auto xl:px-3",
              active
                ? "bg-white text-brand-800 shadow-sm dark:bg-slate-700 dark:text-brand-300"
                : "text-slate-600 hover:bg-white/80 hover:text-brand-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-brand-300",
            )}
          >
            <Icon className={cn("h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110", item.href === "/leaderboard" && "text-amber-500")} aria-hidden />
            <span className="hidden xl:inline">{item.shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
