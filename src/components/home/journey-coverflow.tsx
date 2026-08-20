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
  featured = false,
}: {
  step: (typeof steps)[number];
  index: number;
  tabIndex?: number;
  featured?: boolean;
}) {
  const Icon = step.icon as LucideIcon;
  return (
    <Link
      href={step.href}
      tabIndex={tabIndex}
      className={cn(
        "group flex min-h-[280px] flex-col overflow-hidden rounded-[1.75rem] border bg-white p-6 text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300",
        featured
          ? "border-brand-200/90 shadow-[0_0_0_1px_rgba(52,211,153,.35),0_40px_90px_-24px_rgba(16,185,129,.45)] ring-1 ring-emerald-300/40 dark:border-emerald-700/70 dark:bg-slate-800 dark:ring-emerald-300/30 dark:text-white"
          : "border-slate-200 shadow-[0_24px_70px_-28px_rgba(0,0,0,.55)] dark:border-slate-600 dark:bg-slate-800 dark:text-white",
      )}
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
      <div className="motion-parallax-slow pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full bg-brand-400/15 blur-3xl" aria-hidden />
      <div className="motion-parallax-fast pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">{children}</div>
    </section>
  );
}

const STEP_X = 210; // px between card centres
const SPRING_STIFFNESS = 150;
const SPRING_DAMPING = 20;

export function JourneyCoverflow() {
  const [staticMode, setStaticMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [position, setPosition] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const velocityRef = useRef(0);
  const targetRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const dragRef = useRef<{ id: number; startX: number; startPos: number; lastX: number; lastT: number; vel: number } | null>(null);

  const stopAnimation = useCallback(() => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Spring-integrates the coverflow position toward `target`. Momentum carries
  // the current velocity in, so release-after-drag and arrow clicks feel fluid
  // instead of snapping between discrete steps.
  const animateTo = useCallback((target: number, v0 = 0) => {
    stopAnimation();
    targetRef.current = target;
    velocityRef.current = v0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const diff = targetRef.current - positionRef.current;
      const accel = SPRING_STIFFNESS * diff - SPRING_DAMPING * velocityRef.current;
      velocityRef.current += accel * dt;
      const next = positionRef.current + velocityRef.current * dt;
      positionRef.current = next;
      setPosition(next);
      if (Math.abs(targetRef.current - next) > 0.004 || Math.abs(velocityRef.current) > 0.02) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        positionRef.current = targetRef.current;
        velocityRef.current = 0;
        setPosition(targetRef.current);
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stopAnimation]);

  const next = useCallback(() => animateTo(targetRef.current + 1, 1.1), [animateTo]);
  const prev = useCallback(() => animateTo(targetRef.current - 1, -1.1), [animateTo]);
  const goTo = useCallback((index: number) => animateTo(index), [animateTo]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStaticMode(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (staticMode || isDragging || hovered) return;
    const timer = window.setInterval(() => animateTo(targetRef.current + 1, 1.1), 3800);
    return () => window.clearInterval(timer);
  }, [isDragging, staticMode, hovered, animateTo]);

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

  useEffect(() => stopAnimation, [stopAnimation]);

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
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={(event) => {
          setHovered(false);
          if (isDragging && event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
          setIsDragging(false);
          dragRef.current = null;
        }}
        onPointerDown={(event) => {
          stopAnimation();
          setIsDragging(true);
          dragRef.current = {
            id: event.pointerId,
            startX: event.clientX,
            startPos: positionRef.current,
            lastX: event.clientX,
            lastT: performance.now(),
            vel: 0,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!drag) return;
          const now = performance.now();
          const dt = Math.max(now - drag.lastT, 16);
          const px = (event.clientX - drag.lastX) / STEP_X;
          const instant = px / (dt / 1000); // cards per second
          drag.vel = 0.72 * instant + 0.28 * drag.vel;
          const nextPos = drag.startPos + (event.clientX - drag.startX) / STEP_X;
          positionRef.current = nextPos;
          setPosition(nextPos);
          drag.lastX = event.clientX;
          drag.lastT = now;
        }}
        onPointerUp={(event) => {
          const drag = dragRef.current;
          if (!drag) return;
          const dist = event.clientX - drag.startX;
          const vel = drag.vel;
          dragRef.current = null;
          setIsDragging(false);
          const fling = Math.abs(dist) > 48 || Math.abs(vel) > 0.6;
          let target;
          if (fling) {
            const dir = dist + vel * 120 < 0 ? 1 : -1; // +1 = next, -1 = prev
            target = Math.round(positionRef.current + dir);
          } else {
            target = Math.round(positionRef.current);
          }
          animateTo(target, fling ? (target - positionRef.current) * 1.1 : 0);
        }}
        onPointerCancel={() => {
          const drag = dragRef.current;
          const vel = drag?.vel ?? 0;
          dragRef.current = null;
          setIsDragging(false);
          animateTo(Math.round(positionRef.current), Math.sign(vel) * 0.6);
        }}
      >
        <div className="relative mx-auto flex h-[360px] max-w-5xl items-center justify-center sm:h-[400px]">
          {/* Centre-stage glow that follows the active card */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[22rem] w-[30rem] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/15 blur-[90px] dark:bg-emerald-400/20"
            aria-hidden
          />

          <div className="relative h-full w-full" style={{ perspective: "1400px", transformStyle: "preserve-3d" }}>
            {steps.map((step, index) => {
              const raw = index - position;
              const half = steps.length / 2;
              let offset = raw;
              while (offset > half) offset -= steps.length;
              while (offset < -half) offset += steps.length;
              const abs = Math.abs(offset);
              const isCenter = Math.abs(raw - Math.round(raw)) < 0.5;
              const opacity = isCenter ? 1 : Math.max(0.18, 1 - abs * 0.3);

              return (
                <article
                  key={step.key}
                  data-journey-rail={step.key}
                  className="absolute left-1/2 top-1/2 w-[min(20rem,86vw)] will-change-transform"
                  style={{
                    transform: `translateX(calc(-50% + ${offset * STEP_X}px)) translateY(-50%) translateZ(${isCenter ? 90 : -90 - abs * 30}px) rotateY(${offset * -26}deg) scale(${isCenter ? 1 : 0.88 - abs * 0.02})`,
                    opacity,
                    zIndex: isCenter ? 30 : 20 - abs,
                    pointerEvents: isCenter ? "auto" : "none",
                    filter: isCenter ? "none" : `saturate(${Math.max(0.35, 1 - abs * 0.25)})`,
                  }}
                  aria-hidden={!isCenter}
                >
                  <StepCard step={step} index={index} tabIndex={isCenter ? 0 : -1} featured={isCenter} />
                </article>
              );
            })}
          </div>

          {/* Soft edge fades so cards dissolve into the section */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-40 w-20 bg-gradient-to-r from-slate-950/90 to-transparent sm:w-32" aria-hidden />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-40 w-20 bg-gradient-to-l from-slate-950/90 to-transparent sm:w-32" aria-hidden />

          {/* Glossy floor reflection hint */}
          <div className="pointer-events-none absolute inset-x-8 bottom-1 z-30 h-14 bg-gradient-to-t from-emerald-300/20 to-transparent blur-md dark:from-emerald-300/15" aria-hidden />
        </div>

        {/* Continuous glide progress */}
        <div className="mx-auto mt-6 h-1 w-56 max-w-full overflow-hidden rounded-full bg-white/10" aria-hidden>
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 transition-[width] duration-150 ease-linear"
            style={{ width: `${Math.max(6, Math.min(100, ((position % steps.length) + steps.length) % steps.length * (100 / steps.length))) }%` }}
          />
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          {steps.map((step, index) => {
            const active = Math.abs(position - index) < 0.5;
            return (
              <button
                key={step.key}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`${step.label} ধাপ`}
                aria-current={active ? "true" : undefined}
                className={cn("h-2.5 rounded-full transition-all", active ? "w-8 bg-white" : "w-2.5 bg-white/30 hover:bg-white/55")}
              />
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
