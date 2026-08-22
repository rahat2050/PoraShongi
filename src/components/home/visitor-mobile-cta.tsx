"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export function VisitorMobileCta() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      setVisible(window.scrollY > 520);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <Link
      href="/teachers"
      data-visitor-mobile-cta
      aria-label="শিক্ষক খুঁজুন"
      className={`fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-4 z-30 inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-700 px-4 text-sm font-bold text-white shadow-xl transition-all md:hidden ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
    >
      <Search className="h-4 w-4" aria-hidden /> শিক্ষক খুঁজুন
    </Link>
  );
}
