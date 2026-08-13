import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { siteConfig } from "@/config/site";

const columns = [
  {
    heading: "Marketplace",
    links: [
      { href: "/teachers", label: "Find teachers" },
      { href: "/tuitions", label: "Browse tuitions" },
      { href: "/#roles", label: "For students" },
      { href: "/#roles", label: "For teachers" },
      { href: "/#roles", label: "For guardians" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Create account" },
      { href: "/forgot-password", label: "Reset password" },
    ],
  },
  {
    heading: "Trust & safety",
    links: [
      { href: "/safety", label: "Safety guidelines" },
      { href: "/safety", label: "Report a concern" },
      { href: "/safety", label: "Child safety" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              {siteConfig.tagline} — {siteConfig.taglineEnglish}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Serving {siteConfig.region}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.heading}>
                <h4 className="font-semibold text-slate-700">
                  {column.heading}
                </h4>
                <ul className="mt-3 space-y-2 text-slate-500">
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="transition-colors hover:text-brand-700"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h4 className="font-semibold text-slate-700">Contact</h4>
              <ul className="mt-3 space-y-2 text-slate-500">
                <li>hello@porashongi.com</li>
                <li>Sunamganj / Sylhet, BD</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.brandName} (
            {siteConfig.brandNameBangla}). All rights reserved.
          </p>
          <p>Phase 3 · Core Platform &amp; Trust</p>
        </div>
      </div>
    </footer>
  );
}
