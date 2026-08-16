"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/** নিচে স্ক্রল করলে "উপরে যান" বাটন দেখায় — mobile-এ খুব দরকারি। */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="উপরে যান"
      className={`fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-40 inline-flex h-11 w-11 md:bottom-5 md:right-5 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-all hover:bg-brand-700 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ArrowUp className="h-5 w-5" aria-hidden />
    </button>
  );
}
