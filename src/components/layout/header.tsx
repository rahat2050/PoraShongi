"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/layout/logo";
import { AuthArea } from "@/components/layout/auth-area";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/shared/theme-toggle";

/**
 * Sticky header — scroll down করলে সরে যায়, scroll up করলে ফিরে আসে।
 * `prefers-reduced-motion` থাকলে কখনো লুকায় না; keyboard focus-এও ফিরে আসে।
 */
export function Header() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lastY = window.scrollY;
    let ticking = false;
    let lastHidden = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const delta = y - lastY;
      let nextHidden = lastHidden;
      if (reduced.matches) {
        nextHidden = false;
      } else if (y > 160 && delta > 4) {
        nextHidden = true;
      } else if (delta < -4 || y <= 160) {
        nextHidden = false;
      }
      lastHidden = nextHidden;
      setHidden(nextHidden);
      document.documentElement.style.setProperty("--header-h", nextHidden ? "0px" : "4rem");
      setScrolled(y > 8);
      lastY = y;
    };

    const schedule = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <header
      data-header-hidden={hidden || undefined}
      data-header-scrolled={scrolled || undefined}
      className="site-header sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-[0_1px_12px_rgba(15,23,42,0.05)] dark:border-slate-700/80 dark:bg-slate-950/95 dark:shadow-black/20"
    >
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
