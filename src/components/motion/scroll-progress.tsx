"use client";

import { useEffect, useRef } from "react";

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let frame: number | null = null;
    const update = () => {
      frame = null;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max <= 0 ? 0 : Math.min(window.scrollY / max, 1);
      bar.style.transform = `scaleX(${progress})`;
    };
    const schedule = () => {
      if (frame === null) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 bg-transparent" aria-hidden>
      <div
        ref={barRef}
        data-scroll-progress
        className="h-full origin-left bg-gradient-to-r from-brand-600 via-emerald-400 to-amber-300"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
