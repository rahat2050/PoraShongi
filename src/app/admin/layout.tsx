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
  if (profile.role !== "admin") redirect("/dashboard");

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">অ্যাডমিন প্যানেল</h1>
        <p className="mt-1 text-slate-500">প্ল্যাটফর্ম পরিচালনা — শুধু অ্যাডমিন।</p>
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
