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
    <section ref={sectionRef} className="relative isolate overflow-hidden border-y border-white/10 bg-slate-950 text-white" aria-labelledby="live-stats-title">
      <div className="pointer-events-none absolute -left-28 top-0 -z-10 h-80 w-80 rounded-full bg-brand-600/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 -z-20 opacity-10"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden
      />

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
        <div className="grid items-end gap-5 lg:grid-cols-[1fr_.65fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-300">প্ল্যাটফর্ম স্ন্যাপশট</p>
            <h2 id="live-stats-title" className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">বাস্তব কার্যক্রম, স্বচ্ছ সংখ্যায়</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-300 lg:justify-self-end">
            ব্যবহারকারী, যাচাইকরণ ও টিউশন কার্যক্রমের হালনাগাদ তথ্য—কোনো অনুমান বা সাজানো সংখ্যা নয়।
          </p>
        </div>

        <div className="mt-11 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((item) => {
            const Icon = ICONS[item.key];
            return (
              <Link
                key={item.key}
                href={item.href}
                data-home-action={`stat-${item.key}`}
                className="group flex min-h-52 flex-col rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-center shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-brand-300/60 hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950"
                aria-label={`${item.label}: ${item.value}। ${item.actionLabel}`}
              >
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-brand-200 transition-all group-hover:border-brand-300/40 group-hover:bg-brand-400 group-hover:text-brand-950">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <AnimatedNumber value={item.value} active={visible} label={item.label} />
                <p className="mt-1 text-xs font-semibold text-slate-300">{item.label}</p>
                <span className="mt-auto inline-flex items-center justify-center gap-1 pt-4 text-[11px] font-bold leading-tight text-brand-200 transition-colors group-hover:text-white">
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
    <p className="mt-3 text-3xl font-black tracking-tight text-white">
      <span aria-hidden>{new Intl.NumberFormat("bn-BD").format(display)}</span>
      <span className="sr-only">{label}: {value}</span>
    </p>
  );
}
