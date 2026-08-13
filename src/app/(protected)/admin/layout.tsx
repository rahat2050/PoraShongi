import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server-auth";

const navItems = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/teachers", label: "Teachers" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/guardians", label: "Guardians" },
  { href: "/admin/tuitions", label: "Tuitions" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/verification", label: "Verification" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/reports", label: "Reports" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/dashboard");

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Admin panel</h1>
        <p className="mt-1 text-slate-500">
          Platform management — admin access only.
        </p>
      </div>

      <nav
        className="mb-8 flex flex-wrap gap-2"
        aria-label="Admin sections"
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-brand-400 hover:text-brand-700"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
