"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Circular progress ring that fills from 0 → `value` once it scrolls into the
 * viewport. Reduced-motion/no-JS users get the final value immediately with no
 * animation. Purely SVG stroke-dashoffset — compositor-friendly, no library.
 */
export function ProgressRing({
  value,
  size = 96,
  strokeWidth = 9,
  className,
  trackClassName,
  ringClassName,
  children,
  duration = 900,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  trackClassName?: string;
  ringClassName?: string;
  children?: React.ReactNode;
  duration?: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0);

  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - shown / 100);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || clamped <= 0) {
      const frame = window.requestAnimationFrame(() => setShown(clamped));
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
          setShown(Math.round(clamped * eased));
          if (progress < 1) window.requestAnimationFrame(update);
        };
        window.requestAnimationFrame(update);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [clamped, duration]);

  return (
    <div
      ref={rootRef}
      className={cn("relative inline-flex items-center justify-center", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={cn("stroke-slate-100 dark:stroke-slate-700", trackClassName)}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "stroke-emerald-500 transition-[stroke-dashoffset,stroke] duration-300 ease-out",
            ringClassName,
          )}
        />
      </svg>
      {children ? (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      ) : null}
    </div>
  );
}
