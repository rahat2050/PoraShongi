import Link from "next/link";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "ওভারভিউ" },
  { href: "/dashboard/tuitions", label: "Tuition" },
  { href: "/dashboard/requests", label: "Request" },
  { href: "/dashboard/schedule", label: "Schedule" },
  { href: "/dashboard/notifications", label: "নোটিফিকেশন" },
  { href: "/messages", label: "মেসেজ" },
  { href: "/dashboard/favorites", label: "সেভ করা" },
  { href: "/dashboard/referrals", label: "রেফারেল" },
  { href: "/profile", label: "প্রোফাইল" },
  { href: "/account", label: "সেটিংস" },
];

/** Dashboard-এর ভেতরে দ্রুত নেভিগেশন — সব সেকশনে সহজে যাওয়া যায়। */
export function DashboardNav({ active }: { active?: string }) {
  return (
    <nav
      className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
      aria-label="ড্যাশবোর্ড মেনু"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            active === item.href
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-slate-300 bg-white text-slate-600 hover:border-brand-400 hover:text-brand-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
