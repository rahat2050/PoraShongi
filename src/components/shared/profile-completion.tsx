"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CountUp } from "@/components/motion/count-up";

export function ProfileCompletion({
  percent,
  missing,
}: {
  percent: number;
  missing: string[];
}) {
  const [shown, setShown] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const barColor =
    percent >= 80
      ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
      : percent >= 50
        ? "bg-gradient-to-r from-amber-500 to-amber-400"
        : "bg-gradient-to-r from-red-500 to-red-400";

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = window.requestAnimationFrame(() => setShown(percent));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        timerRef.current = window.setTimeout(() => setShown(percent), 60);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [percent]);

  return (
    <div ref={rootRef} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">প্রোফাইল সম্পূর্ণতা</h2>
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
          <CountUp value={percent} duration={700} />%
        </span>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={cn("h-full rounded-full transition-[width] duration-700 ease-out", barColor)}
          style={{ width: `${shown}%` }}
        />
      </div>
      {missing.length > 0 ? (
        <div className="mt-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">যেগুলো বাকি:</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {missing.slice(0, 6).map((item) => (
              <span key={item} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-200">{item}</span>
            ))}
          </div>
          <Link href="/profile" className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-brand-800 hover:underline dark:text-brand-300">
            প্রোফাইল সম্পূর্ণ করুন →
          </Link>
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-500">আপনার প্রোফাইল সম্পূর্ণ! 🎉</p>
      )}
    </div>
  );
}
