import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server-auth";

const items = [
  { href: "/admin", label: "ওভারভিউ" },
  { href: "/admin/users", label: "ব্যবহারকারী" },
  { href: "/admin/reports", label: "রিপোর্ট" },
  { href: "/admin/audit", label: "অডিট লগ" },
  { href: "/admin/analytics", label: "পরিসংখ্যান" },
  { href: "/admin/blog/new", label: "নতুন ব্লগ" },
];

export const metadata: Metadata = { robots: { index: false, follow: false, nocache: true } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin" && !profile.is_super_admin) redirect("/dashboard");

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900">{profile.is_super_admin ? "সুপার অ্যাডমিন প্যানেল" : "অ্যাডমিন প্যানেল"}</h1>
          {profile.is_super_admin && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-200">সম্পূর্ণ নিয়ন্ত্রণ</span>}
        </div>
        <p className="mt-1 text-slate-500">ব্যবহারকারী, রিপোর্ট, ভেরিফিকেশন, পরিসংখ্যান ও অডিট পরিচালনা করুন।</p>
      </div>
      <nav className="mb-8 flex flex-wrap gap-2" aria-label="অ্যাডমিন">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:border-brand-500 hover:text-brand-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-brand-300">
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
