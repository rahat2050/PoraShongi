import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { AuthArea } from "@/components/layout/auth-area";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageToggle } from "@/components/shared/language-toggle";

const navLinks = [
  { href: "/teachers", label: "শিক্ষক খুঁজুন" },
  { href: "/tuitions", label: "Tuition" },
  { href: "/leaderboard", label: "সেরা শিক্ষক" },
  { href: "/blog", label: "ব্লগ" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/90">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex" aria-label="Main">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-brand-700">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <LanguageToggle />
          <div className="hidden md:block">
            <AuthArea />
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
