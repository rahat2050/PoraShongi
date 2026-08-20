"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Viewport-এ ঢুকলে 0 থেকে value পর্যন্ত count-up করে। Reduced-motion/no-JS-এ
 * সরাসরি final value দেখায়। Numeric stat ও fee-র জন্য reusable।
 */
export function CountUp({
  value,
  duration = 800,
  className,
  format,
}: {
  value: number;
  duration?: number;
  className?: string;
  format?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || value <= 0) {
      const frame = window.requestAnimationFrame(() => setDisplay(value));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const startedAt = performance.now();
        const update = (now: number) => {
          const progress = Math.min((now - startedAt) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(value * eased));
          if (progress < 1) window.requestAnimationFrame(update);
        };
        window.requestAnimationFrame(update);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {format ? format(display) : display}
    </span>
  );
}
