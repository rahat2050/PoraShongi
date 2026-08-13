import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { AuthArea } from "@/components/layout/auth-area";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#roles", label: "Who it's for" },
  { href: "/#security", label: "Security" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav
          className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex"
          aria-label="Main"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-brand-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <AuthArea />
      </div>
    </header>
  );
}
