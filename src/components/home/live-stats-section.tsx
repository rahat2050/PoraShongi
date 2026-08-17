"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, GraduationCap, Handshake, MapPinned, ScrollText, Users } from "lucide-react";

export type LiveStatItem = {
  key: "students" | "teachers" | "connections" | "tuitions" | "verified" | "districts";
  label: string;
  value: number;
  href: string;
  actionLabel: string;
};

const ICONS = {
  students: Users,
  teachers: GraduationCap,
  connections: Handshake,
  tuitions: ScrollText,
  verified: BadgeCheck,
  districts: MapPinned,
} as const;

export function LiveStatsSection({ items }: { items: LiveStatItem[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="border-y border-brand-100 bg-brand-50/60 dark:border-slate-700 dark:bg-slate-950" aria-labelledby="live-stats-title">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-800 dark:text-brand-300">লাইভ প্ল্যাটফর্ম</p>
          <h2 id="live-stats-title" className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">এক নজরে পড়াসাথী</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">বাস্তব ব্যবহারকারী ও টিউশন কার্যক্রমের হালনাগাদ সংখ্যা।</p>
        </div>

        <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((item) => {
            const Icon = ICONS[item.key];
            return (
              <Link
                key={item.key}
                href={item.href}
                data-home-action={`stat-${item.key}`}
                className="group flex min-h-56 flex-col rounded-2xl border border-brand-100 bg-white p-4 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-4 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-brand-600"
                aria-label={`${item.label}: ${item.value}। ${item.actionLabel}`}
              >
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-800 transition-colors group-hover:bg-brand-700 group-hover:text-white dark:bg-brand-950/70 dark:text-brand-300 dark:group-hover:bg-brand-700 dark:group-hover:text-white">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <AnimatedNumber value={item.value} active={visible} label={item.label} />
                <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300">{item.label}</p>
                <span className="mt-auto inline-flex items-center justify-center gap-1 pt-4 text-[11px] font-semibold leading-tight text-brand-800 dark:text-brand-300">
                  {item.actionLabel}
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AnimatedNumber({ value, active, label }: { value: number; active: boolean; label: string }) {
  const [display, setDisplay] = useState(active ? value : 0);

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    if (value <= 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frame = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(frame);
    }

    const startedAt = performance.now();
    const duration = 900;
    const update = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [active, value]);

  return (
    <p className="mt-3 text-3xl font-extrabold text-brand-800 dark:text-brand-300">
      <span aria-hidden>{new Intl.NumberFormat("bn-BD").format(display)}</span>
      <span className="sr-only">{label}: {value}</span>
    </p>
  );
}
