import { Logo } from "@/components/layout/logo";
import { AuthArea } from "@/components/layout/auth-area";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-[0_1px_12px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-950/90 dark:shadow-black/20">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo />
        <DesktopNav />
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <div className="hidden md:block">
            <AuthArea />
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
