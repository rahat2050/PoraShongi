"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "ওভারভিউ", roles: ["student", "guardian", "teacher"] },
  { href: "/dashboard/tuitions", label: "টিউশন", roles: ["student", "guardian", "teacher"] },
  { href: "/dashboard/requests", label: "অনুরোধ", roles: ["student", "guardian", "teacher"] },
  { href: "/dashboard/schedule", label: "সময়সূচি", roles: ["student", "guardian", "teacher"] },
  { href: "/dashboard/notifications", label: "নোটিফিকেশন", roles: ["student", "guardian", "teacher"] },
  { href: "/messages", label: "মেসেজ", roles: ["student", "guardian", "teacher"] },
  { href: "/dashboard/favorites", label: "সেভ করা", roles: ["student", "guardian"] },
  { href: "/dashboard/referrals", label: "রেফারেল", roles: ["student", "guardian", "teacher"] },
  { href: "/profile", label: "প্রোফাইল", roles: ["student", "guardian", "teacher"] },
  { href: "/account", label: "সেটিংস", roles: ["student", "guardian", "teacher"] },
] as const;

/** Persistent, role-aware navigation shared by every dashboard page. */
export function DashboardNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const visibleItems = items.filter((item) => (item.roles as readonly string[]).includes(role));

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === `/dashboard/${role}`;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="scrollbar-none flex gap-2 overflow-x-auto py-2" aria-label="ড্যাশবোর্ড মেনু">
      {visibleItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2",
              active
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-brand-500 hover:text-brand-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-400 dark:hover:text-brand-300",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
