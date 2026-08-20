"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  Handshake,
  Search,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { key: "discover", label: "Discover", title: "প্রয়োজন অনুযায়ী খুঁজুন", text: "ক্লাস, বিষয়, এলাকা ও মাধ্যম দিয়ে শিক্ষক তালিকা দেখুন।", href: "/teachers", icon: Search },
  { key: "match", label: "Match", title: "সেরা মিল বাছুন", text: "ফিল্টার ও প্রাসঙ্গিকতা দিয়ে যে শিক্ষক সবচেয়ে কাছাকাছি, তা দেখুন।", href: "/teachers?sort=relevance", icon: Sparkles },
  { key: "connect", label: "Connect", title: "নিরাপদে যুক্ত হোন", text: "পছন্দ হলে অনুরোধ পাঠান—যোগাযোগ নিয়ন্ত্রিত থাকে।", href: "/teachers", icon: Handshake },
  { key: "manage", label: "Manage", title: "সময়সূচি চালান", text: "সেশন, উপস্থিতি ও শেখার কাজ এক জায়গায় রাখুন।", href: "/dashboard/schedule", icon: CalendarCheck2 },
  { key: "trust", label: "Trust", title: "যাচাই করে এগোন", text: "ভেরিফিকেশন, নিরাপত্তা ও স্বচ্ছ প্রক্রিয়া আগে জেনে নিন।", href: "/safety", icon: ShieldCheck },
] as const;

function StepCard({
  step,
  index,
  tabIndex = 0,
}: {
  step: (typeof steps)[number];
  index: number;
  tabIndex?: number;
}) {
  const Icon = step.icon as LucideIcon;
  return (
    <Link
      href={step.href}
      tabIndex={tabIndex}
      className="group flex min-h-[280px] flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 text-slate-950 shadow-[0_24px_70px_-28px_rgba(0,0,0,.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
      aria-label={`${step.label}: ${step.title}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-lg shadow-brand-900/20">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700 dark:text-slate-200">
          {step.label} · 0{index + 1}
        </span>
      </div>
      <h3 className="mt-8 text-2xl font-black tracking-tight">{step.title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200">{step.text}</p>
      <span className="mt-auto inline-flex items-center justify-between gap-3 border-t border-slate-200 pt-5 text-sm font-bold text-brand-800 dark:border-slate-600 dark:text-emerald-200">
        এগিয়ে যান
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
      </span>
    </Link>
  );
}

function SectionShell({ children }: { children: ReactNode }) {
  return (
    <section className="relative overflow-x-clip overflow-y-hidden bg-[linear-gradient(180deg,#042f2e_0%,#0f172a_48%,#020617_100%)] text-white" aria-labelledby="journey-coverflow-title">
      <div className="pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full bg-brand-400/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">{children}</div>
    </section>
  );
}

export function JourneyCoverflow() {
  const [idx, setIdx] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [staticMode, setStaticMode] = useState(false);
  const startX = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);

  const next = useCallback(() => setIdx((value) => (value + 1) % steps.length), []);
  const prev = useCallback(() => setIdx((value) => (value - 1 + steps.length) % steps.length), []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStaticMode(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (staticMode || isDragging) return;
    const timer = window.setInterval(next, 3600);
    return () => window.clearInterval(timer);
  }, [isDragging, next, staticMode]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") prev();
      if (event.key === "ArrowRight") next();
    };
    stage.addEventListener("keydown", onKey);
    return () => stage.removeEventListener("keydown", onKey);
  }, [next, prev]);

  if (staticMode) {
    return (
      <SectionShell>
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-200">Cinematic journey</p>
          <h2 id="journey-coverflow-title" className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Discover থেকে Trust—পাঁচটি পরিষ্কার ধাপ
          </h2>
        </div>
        <div data-journey-coverflow data-journey-coverflow-motion="static" className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {steps.map((step, index) => (
            <article key={step.key} data-journey-rail={step.key}>
              <StepCard step={step} index={index} />
            </article>
          ))}
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-200">Cinematic journey</p>
          <h2 id="journey-coverflow-title" className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            স্ক্রল নয়—স্লাইড উল্টে পুরো পথ দেখুন
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-200">
            Discover থেকে Trust—পাঁচটি ধাপ 3D coverflow-এ। Swipe করুন, তীর চাপুন, বা বসুন দেখুন।
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={prev} aria-label="আগের ধাপ" className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/10">
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button type="button" onClick={next} aria-label="পরের ধাপ" className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/10">
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="শেখার যাত্রার 3D ক্যারোসেল"
        data-journey-coverflow
        data-journey-coverflow-motion="enabled"
        className="relative mt-10 select-none outline-none"
        style={{ touchAction: "pan-y" }}
        onPointerDown={(event) => {
          setIsDragging(true);
          startX.current = event.clientX;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!isDragging) return;
          setDragX(event.clientX - startX.current);
        }}
        onPointerUp={(event) => {
          if (!isDragging) return;
          const diff = event.clientX - startX.current;
          if (Math.abs(diff) > 50) {
            if (diff > 0) prev();
            else next();
          }
          setIsDragging(false);
          setDragX(0);
        }}
        onPointerCancel={() => {
          setIsDragging(false);
          setDragX(0);
        }}
      >
        <div className="relative mx-auto flex h-[360px] max-w-5xl items-center justify-center sm:h-[400px]">
          <div className="relative h-full w-full" style={{ perspective: "1400px", transformStyle: "preserve-3d" }}>
            {steps.map((step, index) => {
              let offset = index - idx;
              const half = Math.floor(steps.length / 2);
              if (offset > half) offset -= steps.length;
              if (offset < -half) offset += steps.length;
              const abs = Math.abs(offset);
              const isCenter = offset === 0;
              const drag = isDragging ? dragX * 0.04 : 0;

              return (
                <article
                  key={step.key}
                  data-journey-rail={step.key}
                  className="absolute left-1/2 top-1/2 w-[min(20rem,86vw)] -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    transform: `translateX(calc(-50% + ${offset * 250 + drag * 2}px)) translateZ(${isCenter ? 80 : -90 - abs * 30}px) rotateY(${offset * -26 + drag * 0.12}deg) scale(${isCenter ? 1 : 0.86 - abs * 0.04})`,
                    opacity: abs > 2 ? 0 : isCenter ? 1 : 0.62 - abs * 0.14,
                    zIndex: isCenter ? 30 : 20 - abs,
                    pointerEvents: isCenter ? "auto" : "none",
                    visibility: abs > 2 ? "hidden" : "visible",
                  }}
                  aria-hidden={!isCenter}
                >
                  <StepCard step={step} index={index} tabIndex={isCenter ? 0 : -1} />
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {steps.map((step, index) => (
            <button
              key={step.key}
              type="button"
              onClick={() => setIdx(index)}
              aria-label={`${step.label} ধাপ`}
              aria-current={index === idx ? "true" : undefined}
              className={cn("h-2.5 rounded-full transition-all", index === idx ? "w-8 bg-white" : "w-2.5 bg-white/30 hover:bg-white/55")}
            />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
