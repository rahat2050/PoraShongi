"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { CountUp } from "@/components/motion/count-up";
import { ProgressRing } from "@/components/motion/progress-ring";

export function ProfileCompletion({
  percent,
  missing,
}: {
  percent: number;
  missing: string[];
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const ringColor =
    clamped >= 80
      ? "stroke-emerald-500"
      : clamped >= 50
        ? "stroke-amber-500"
        : "stroke-red-500";
  const textColor =
    clamped >= 80
      ? "text-emerald-600 dark:text-emerald-400"
      : clamped >= 50
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">প্রোফাইল সম্পূর্ণতা</h2>

      <div className="mt-4 flex items-center gap-5">
        <ProgressRing value={clamped} size={96} strokeWidth={9} ringClassName={ringColor} className="shrink-0">
          <span className={cn("text-xl font-black tracking-tight", textColor)}>
            <CountUp value={clamped} duration={700} />
            <span className="text-sm font-bold">%</span>
          </span>
        </ProgressRing>

        <div className="min-w-0 flex-1">
          {missing.length > 0 ? (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400">যেগুলো বাকি:</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {missing.slice(0, 6).map((item) => (
                  <span key={item} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                    {item}
                  </span>
                ))}
              </div>
              <Link
                href="/profile"
                className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-brand-800 hover:underline dark:text-brand-300"
              >
                প্রোফাইল সম্পূর্ণ করুন →
              </Link>
            </>
          ) : (
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              আপনার প্রোফাইল সম্পূর্ণ! 🎉
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
