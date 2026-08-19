"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Handshake,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  CalendarCheck2,
  Users,
  Eye,
  Layers,
  Zap,
  MonitorSmartphone,
} from "lucide-react";
import { PointerTilt } from "@/components/motion/pointer-tilt";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock teachers for coverflow
const mockTeachers = [
  {
    id: 1,
    name: "Anika Rahman",
    subject: "Physics • HSC",
    location: "Dhanmondi, Dhaka",
    rating: "4.9",
    reviews: 24,
    color: "from-emerald-600 to-teal-600",
    initial: "A",
  },
  {
    id: 2,
    name: "Fahim Ahmed",
    subject: "Math • Class 9-10",
    location: "Cantonment, Cumilla",
    rating: "5.0",
    reviews: 31,
    color: "from-amber-500 to-orange-600",
    initial: "F",
  },
  {
    id: 3,
    name: "Sadia Islam",
    subject: "English • IELTS",
    location: "Gulshan, Dhaka",
    rating: "4.8",
    reviews: 18,
    color: "from-violet-600 to-indigo-600",
    initial: "S",
  },
  {
    id: 4,
    name: "Rahat Khan",
    subject: "Chemistry • Admission",
    location: "Rajshahi",
    rating: "4.9",
    reviews: 42,
    color: "from-rose-600 to-pink-600",
    initial: "R",
  },
  {
    id: 5,
    name: "Nusrat Jahan",
    subject: "Biology • Medical",
    location: "Chittagong",
    rating: "5.0",
    reviews: 27,
    color: "from-cyan-600 to-blue-600",
    initial: "N",
  },
];

const journeySteps = [
  {
    key: "discover",
    label: "01 — Discover",
    title: "শিক্ষক খুঁজুন",
    desc: "ক্লাস, বিষয়, এলাকা লিখে সার্চ করুন। লগইন ছাড়াই সব প্রোফাইল দেখতে পারবেন।",
    icon: Search,
    color: "bg-emerald-600",
  },
  {
    key: "match",
    label: "02 — Match",
    title: "সেরা মিল দেখুন",
    desc: "AI ম্যাচ স্কোর দেখে বুঝুন কোন শিক্ষক আপনার জন্য সবচেয়ে উপযুক্ত।",
    icon: Sparkles,
    color: "bg-amber-500",
  },
  {
    key: "connect",
    label: "03 — Connect",
    title: "নিরাপদে অনুরোধ পাঠান",
    desc: "পছন্দের শিক্ষককে টিউশন রিকোয়েস্ট পাঠান, সরাসরি নাম্বার শেয়ার নয়।",
    icon: Handshake,
    color: "bg-violet-600",
  },
  {
    key: "manage",
    label: "04 — Manage",
    title: "সময় ও সেশন ম্যানেজ করুন",
    desc: "ক্যালেন্ডার, মেসেজ, পেমেন্ট — সব এক জায়গায়।",
    icon: CalendarCheck2,
    color: "bg-cyan-600",
  },
  {
    key: "trust",
    label: "05 — Trust",
    title: "যাচাই ও নিরাপত্তা",
    desc: "Verified badge, review, NID যাচাই — বিশ্বাস নিয়ে শুরু করুন।",
    icon: ShieldCheck,
    color: "bg-rose-600",
  },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> PoraSathi হোমে ফিরুন
          </Link>
          <span className="hidden items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 sm:inline-flex dark:bg-amber-900/30 dark:text-amber-300">
            <Eye className="h-3.5 w-3.5" /> LIVE DEMO — 6টি Animation
          </span>
        </div>
      </div>

      {/* Hero intro */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="pointer-events-none absolute -left-20 top-10 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-800/20" />
        <div className="pointer-events-none absolute -right-20 top-20 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-700/10" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-bold tracking-wide text-brand-800 dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-200">
              <Sparkles className="h-4 w-4" /> তুমি যেটা খুঁজছিলে — PowerPoint er moto 3D Flip
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-white">
              এই 6টা Animation
              <span className="block bg-gradient-to-r from-brand-700 via-emerald-600 to-amber-500 bg-clip-text text-transparent">
                PoraSathi তে যোগ করা যাবে
              </span>
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
              নিচে scroll করো। প্রতিটা section live. কোনটা ভালো লাগলো মনে রাখো — আমি সেটাই তোমার আসল সাইটে permanent add করে দিব।
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-slate-900 px-3 py-1.5 text-white dark:bg-white dark:text-slate-900">
                01 Scrollytelling
              </span>
              <span className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                02 Coverflow
              </span>
              <span className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                03 3D Tilt
              </span>
              <span className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                04 Count-up
              </span>
              <span className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                05 Parallax
              </span>
              <span className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                06 Smooth
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* DEMO 1: Scrollytelling / Presentation Flip */}
      <ScrollytellingDemo />

      {/* DEMO 2: Coverflow */}
      <CoverflowDemo />

      {/* DEMO 3: 3D Tilt */}
      <TiltDemo />

      {/* DEMO 4: Stats Count-up */}
      <StatsDemo />

      {/* DEMO 5: Parallax Depth */}
      <ParallaxDemo />

      {/* DEMO 6: Before/After + CTA */}
      <FinalCta />
    </div>
  );
}

function ScrollytellingDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const progress = Math.min(Math.max(-rect.top / (rect.height - window.innerHeight), 0), 0.999);
      const idx = Math.floor(progress * journeySteps.length);
      setActive(Math.min(idx, journeySteps.length - 1));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section ref={containerRef} className="relative bg-slate-950" style={{ height: "280vh" }}>
      <div className="sticky top-0 flex h-[100vh] flex-col overflow-hidden">
        {/* Top bar */}
        <div className="border-b border-white/10 bg-slate-950 px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
                <Layers className="h-4 w-4" /> DEMO 01 — Scrollytelling / PowerPoint Flip
              </p>
              <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">Scroll করলেই slide flip হবে</h2>
              <p className="text-xs text-slate-400 sm:text-sm">
                এটা Apple er website er moto. PoraSathi Hero te ব্যবহার হবে।
              </p>
            </div>
            <div className="hidden items-center gap-1 sm:flex">
              {journeySteps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    i === active ? "w-8 bg-emerald-400" : i < active ? "w-6 bg-white/40" : "w-6 bg-white/15"
                  )}
                />
              ))}
            </div>
          </div>
          {/* Progress */}
          <div className="mx-auto mt-3 h-1 max-w-7xl overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-200"
              style={{ width: `${((active + 1) / journeySteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 items-center px-4 py-6 sm:px-6">
          <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
            {/* Left: Steps list */}
            <div className="order-2 lg:order-1">
              <div className="space-y-2">
                {journeySteps.map((step, i) => {
                  const Icon = step.icon;
                  const isActive = i === active;
                  const isPast = i < active;
                  return (
                    <div
                      key={step.key}
                      className={cn(
                        "flex gap-4 rounded-2xl border p-4 transition-all duration-500",
                        isActive
                          ? "border-white/20 bg-white text-slate-900 shadow-2xl scale-[1.02]"
                          : isPast
                            ? "border-white/10 bg-white/5 text-white/70"
                            : "border-white/5 bg-white/[0.02] text-white/40"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition-colors",
                          isActive ? step.color : "bg-white/10"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-xs font-bold uppercase tracking-widest",
                            isActive ? "text-emerald-700" : "text-white/50"
                          )}
                        >
                          {step.label}
                        </p>
                        <p className={cn("text-base font-black", isActive ? "text-slate-900" : "text-white")}>
                          {step.title}
                        </p>
                        <p className={cn("mt-1 text-sm leading-5", isActive ? "text-slate-600" : "text-white/60")}>
                          {step.desc}
                        </p>
                      </div>
                      {isActive && (
                        <span className="hidden h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500 sm:block" />
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-center text-xs text-slate-500 lg:text-left">
                👆 Scroll up/down করো — card auto flip হবে। মোবাইলে swipe করো।
              </p>
            </div>

            {/* Right: Phone-like flip card */}
            <div className="order-1 lg:order-2">
              <div className="relative mx-auto max-w-[380px]">
                <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/20 via-transparent to-amber-500/20 blur-2xl" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-b from-white to-slate-50 p-3 shadow-[0_32px_80px_-20px_rgba(0,0,0,.6)]">
                  {/* Phone header */}
                  <div className="flex items-center justify-between border-b border-slate-200 px-3 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                        <Sparkles className="h-4 w-4 text-amber-300" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-900">PoraSathi</p>
                        <p className="text-xs text-slate-500">5টি ধাপে সম্পূর্ণ</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      Step {active + 1}/5
                    </span>
                  </div>

                  {/* Flip stage */}
                  <div className="relative mt-3 h-[340px] overflow-hidden rounded-2xl bg-slate-900 p-4">
                    {/* Animated background */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-emerald-500 blur-3xl" />
                      <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-amber-500 blur-3xl" />
                    </div>

                    {/* Card stack */}
                    <div className="relative h-full">
                      {journeySteps.map((step, i) => {
                        const Icon = step.icon;
                        const offset = i - active;
                        const isActive = i === active;
                        return (
                          <div
                            key={step.key}
                            className="absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                            style={{
                              transform: `perspective(1000px) translateX(${offset * 24}px) translateZ(${isActive ? 0 : -80 - Math.abs(offset) * 30}px) rotateY(${offset * -12}deg) scale(${isActive ? 1 : 0.92 - Math.abs(offset) * 0.05})`,
                              opacity: Math.abs(offset) > 1 ? 0 : isActive ? 1 : 0.45,
                              zIndex: isActive ? 10 : 5 - Math.abs(offset),
                              pointerEvents: isActive ? "auto" : "none",
                            }}
                          >
                            <div className="flex h-full flex-col rounded-2xl border border-white/15 bg-white p-5 shadow-xl">
                              <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl text-white", step.color)}>
                                <Icon className="h-7 w-7" />
                              </div>
                              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-emerald-600">{step.label}</p>
                              <h3 className="mt-1 text-2xl font-black leading-tight text-slate-900">{step.title}</h3>
                              <p className="mt-3 text-sm leading-6 text-slate-600">{step.desc}</p>
                              <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                                <span className="text-xs font-semibold text-slate-500">PoraSathi Journey</span>
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">
                                  <ArrowRight className="h-4 w-4" />
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between px-1">
                    <span className="text-xs font-medium text-slate-500">Scroll to explore</span>
                    <span className="text-xs font-bold text-slate-900">{active + 1} / 5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CoverflowDemo() {
  const [idx, setIdx] = useState(2);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  const next = () => setIdx((p) => (p + 1) % mockTeachers.length);
  const prev = () => setIdx((p) => (p - 1 + mockTeachers.length) % mockTeachers.length);

  // auto play
  useEffect(() => {
    if (isDragging) return;
    const t = setInterval(next, 3200);
    return () => clearInterval(t);
  }, [isDragging]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragX(e.clientX - startX.current);
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startX.current;
    if (diff > 60) prev();
    else if (diff < -60) next();
    setIsDragging(false);
    setDragX(0);
  };

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900 sm:py-20">
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl dark:bg-violet-900/20" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
            <Layers className="h-4 w-4" /> DEMO 02 — 3D Coverflow Carousel
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Featured Teacher — 3D Flip Coverflow
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-300">
            Swipe / Drag করো বা arrow চাপো। এটা App Store er 3D slider er moto। Tomar homepage er
            <span className="font-bold text-violet-700 dark:text-violet-300"> Featured Teachers </span>
            section e bosbe।
          </p>
        </div>

        {/* Stage */}
        <div className="relative mt-10 select-none">
          <div
            className="relative mx-auto flex h-[360px] max-w-5xl items-center justify-center overflow-visible perspective-[1200px]"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={() => {
              setIsDragging(false);
              setDragX(0);
            }}
            style={{ touchAction: "pan-y" }}
          >
            {/* Cards */}
            <div className="relative h-full w-full" style={{ perspective: "1200px", transformStyle: "preserve-3d" }}>
              {mockTeachers.map((t, i) => {
                let offset = i - idx;
                // wrap for infinite feel (shortest distance)
                if (offset > 2) offset -= mockTeachers.length;
                if (offset < -2) offset += mockTeachers.length;

                const abs = Math.abs(offset);
                const isCenter = offset === 0;

                // Add drag influence
                const dragInfluence = isDragging ? dragX * 0.02 : 0;

                return (
                  <div
                    key={t.id}
                    className="absolute left-1/2 top-1/2 h-[300px] w-[280px] -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{
                      transform: `translateX(calc(-50% + ${offset * 200 + dragInfluence * 10}px)) translateZ(${isCenter ? 80 : -80 - abs * 40}px) rotateY(${offset * -28 + dragInfluence}deg) scale(${isCenter ? 1 : 0.88 - abs * 0.06})`,
                      opacity: abs > 2 ? 0 : isCenter ? 1 : 0.6 - abs * 0.15,
                      zIndex: isCenter ? 20 : 10 - abs,
                      pointerEvents: isCenter ? "auto" : "none",
                    }}
                  >
                    <Link
                      href="/teachers"
                      className={cn(
                        "group flex h-full flex-col overflow-hidden rounded-[1.75rem] border bg-white shadow-xl transition-all hover:shadow-2xl dark:bg-slate-800",
                        isCenter ? "border-violet-200 dark:border-violet-800" : "border-slate-200 dark:border-slate-700"
                      )}
                    >
                      <div className={cn("h-2 w-full bg-gradient-to-r", t.color)} />
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-start justify-between">
                          <div
                            className={cn(
                              "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-black text-white shadow-lg",
                              t.color
                            )}
                          >
                            {t.initial}
                          </div>
                          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {t.rating}{" "}
                            <span className="font-normal opacity-70">({t.reviews})</span>
                          </span>
                        </div>
                        <h3 className="mt-4 text-lg font-black leading-tight text-slate-900 dark:text-white">{t.name}</h3>
                        <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">{t.subject}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <MapPin className="h-3 w-3" /> {t.location}
                        </p>
                        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-700">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">প্রোফাইল দেখুন</span>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white transition-transform group-hover:translate-x-0.5 dark:bg-white dark:text-slate-900">
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Arrows */}
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-2 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 shadow-lg backdrop-blur hover:bg-white dark:border-slate-700 dark:bg-slate-800 sm:left-4"
            >
              <ChevronLeft className="h-5 w-5 text-slate-700 dark:text-white" />
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-2 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 shadow-lg backdrop-blur hover:bg-white dark:border-slate-700 dark:bg-slate-800 sm:right-4"
            >
              <ChevronRight className="h-5 w-5 text-slate-700 dark:text-white" />
            </button>
          </div>

          {/* Dots */}
          <div className="mt-6 flex justify-center gap-2">
            {mockTeachers.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === idx ? "w-8 bg-violet-600" : "w-2 bg-slate-300 dark:bg-slate-700"
                )}
                aria-label={`Go to ${i + 1}`}
              />
            ))}
          </div>
          <p className="mt-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
            👆 Drag / Swipe করো — 3D flip দেখো • Auto-play চলছে
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white dark:bg-white dark:text-slate-900">
            PoraSathi → Featured Teachers এ এটা বসবে
          </span>
        </div>
      </div>
    </section>
  );
}

function TiltDemo() {
  const cards = [
    {
      icon: GraduationCap,
      title: "শিক্ষার্থী",
      desc: "ক্লাস, বিষয়, এলাকা অনুযায়ী যোগ্য শিক্ষক খুঁজুন।",
      cta: "শিক্ষক দেখুন",
      gradient: "from-emerald-600 to-teal-600",
    },
    {
      icon: Users,
      title: "অভিভাবক",
      desc: "সন্তানের জন্য শিক্ষক খুঁজুন এবং অগ্রগতি পরিচালনা করুন।",
      cta: "সন্তানের জন্য খুঁজুন",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      icon: ShieldCheck,
      title: "শিক্ষক",
      desc: "নিজের প্রোফাইল তৈরি করুন, শিক্ষার্থী খুঁজুন।",
      cta: "টিউশন দেখুন",
      gradient: "from-violet-600 to-indigo-600",
    },
  ];
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            <MonitorSmartphone className="h-4 w-4" /> DEMO 03 — 3D Tilt + Depth (Mouse Hover)
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Card এ mouse নাও — 3D তে বেঁকে যাবে
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Laptop e mouse hover করো, mobile e just tap করো। PoraSathi er Role cards, Teacher cards এ এই effect টা হবে। Performance 100% smooth, CSS only।
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <PointerTilt key={card.title} maxRotation={6} maxLayerOffset={14} className="group">
                <div className="relative flex min-h-[300px] flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-[1px] shadow-lg transition-shadow hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100", card.gradient)} style={{ opacity: 0.08 }} />
                  <div className="pointer-tilt-layer absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-20 blur-2xl" data-pointer-layer="0.6" />
                  <div className="relative flex flex-1 flex-col rounded-[1.7rem] bg-white p-6 dark:bg-slate-900">
                    <div
                      className={cn(
                        "pointer-tilt-layer flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md",
                        card.gradient
                      )}
                      data-pointer-layer="0.4"
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="pointer-tilt-layer mt-5 text-xl font-black text-slate-900 dark:text-white" data-pointer-layer="0.3">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{card.desc}</p>
                    <div className="pointer-tilt-layer mt-auto flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800" data-pointer-layer="0.35">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{card.cta}</span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </PointerTilt>
            );
          })}
        </div>
        <p className="mt-6 text-center text-xs font-medium text-slate-500">
          👆 Desktop e card er upor mouse ঘোরাও — depth layer আলাদা আলাদা নড়বে
        </p>
      </div>
    </section>
  );
}

function StatsDemo() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [counts, setCounts] = useState([0, 0, 0, 0]);

  const targets = [1247, 589, 3421, 64];

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCounts(targets.map((t) => Math.floor(t * eased)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  const labels = ["সংযুক্ত শিক্ষার্থী", "নিবন্ধিত শিক্ষক", "সফল সংযোগ", "জেলা কভারেজ"];

  return (
    <section ref={statsRef} className="relative overflow-hidden bg-slate-900 py-16 sm:py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-900" />
      <div className="pointer-events-none absolute -left-20 top-0 h-96 w-96 rounded-full bg-emerald-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300">
            <Zap className="h-4 w-4" /> DEMO 04 — Count-up Stats (Scroll Trigger)
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Scroll করে এখানে আসলে number গুনবে
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            PoraSathi er Live Stats section e 0 থেকে গুনে উঠবে — trust অনেক বাড়ে।
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {targets.map((t, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur transition-transform hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
              <p className="relative text-xs font-bold uppercase tracking-widest text-emerald-300">{labels[i]}</p>
              <p className="relative mt-2 text-4xl font-black tracking-tight text-white tabular-nums">
                {counts[i].toLocaleString("en-BD")}
                <span className="text-emerald-400">+</span>
              </p>
              <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 transition-all duration-200"
                  style={{ width: `${inView ? 70 + i * 7 : 0}%` }}
                />
              </div>
              <p className="relative mt-2 text-xs text-slate-400">Realtime • Live update</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => {
              setInView(false);
              setCounts([0, 0, 0, 0]);
              setTimeout(() => setInView(true), 100);
            }}
            className="rounded-full bg-white px-5 py-2 text-sm font-bold text-slate-900 hover:bg-slate-100"
          >
            ↻ আবার গুনে দেখো
          </button>
        </div>
      </div>
    </section>
  );
}

function ParallaxDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const progress = Math.min(Math.max(1 - rect.top / window.innerHeight, 0), 1);
      setScrollY(progress);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-y border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            <Layers className="h-4 w-4" /> DEMO 05 — Parallax Depth (Slow vs Fast)
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Depth — পিছনে আস্তে, সামনে জোরে
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Scroll করো — দেখো 3টা layer আলাদা speed এ নড়ছে। PoraSathi hero background এ এই effect টা subtle ভাবে আছে।
          </p>
        </div>

        <div className="relative mx-auto mt-10 h-[420px] max-w-4xl overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 shadow-xl dark:border-slate-800 dark:bg-slate-950">
          {/* Layer 1 - far (slow) */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              transform: `translateY(${scrollY * 30}px)`,
              backgroundImage:
                "linear-gradient(rgba(16,185,129,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,.15) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          {/* Layer 2 - mid */}
          <div
            className="absolute left-6 right-6 top-10 h-32 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur-[1px] dark:from-emerald-800/20"
            style={{ transform: `translateY(${scrollY * 60}px)` }}
          />
          <div
            className="absolute bottom-10 left-10 right-10 h-28 rounded-2xl bg-gradient-to-r from-amber-400/20 to-orange-400/20 blur-[1px]"
            style={{ transform: `translateY(${scrollY * -40}px)` }}
          />
          {/* Layer 3 - near (fast) */}
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div
              className="w-full max-w-md rounded-2xl border border-white/80 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
              style={{ transform: `translateY(${scrollY * -10}px)` }}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">PoraSathi Hero Card</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Fastest layer — সামনে</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800" />
                <div className="h-3 w-5/6 rounded-full bg-slate-100 dark:bg-slate-800" />
                <div className="h-3 w-4/6 rounded-full bg-emerald-100 dark:bg-emerald-900/30" />
              </div>
              <div
                className="mt-4 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white dark:bg-white dark:text-slate-900"
                style={{ transform: `translateY(${scrollY * 15}px)` }}
              >
                <span className="text-sm font-bold">Parallax Demo</span>
                <span className="text-xs opacity-70">{Math.round(scrollY * 100)}% scroll</span>
              </div>
            </div>
          </div>

          {/* Depth indicator */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white dark:bg-white dark:text-slate-900">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Scroll করো — layer গুলো দেখো
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-slate-50 py-16 dark:bg-slate-950 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 sm:p-10">
              <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                কোনটা PoraSathi তে add করব?
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                তুমি যেটা পছন্দ করেছ সেটা বলো — আমি আজই তোমার আসল homepage এ permanent add করে দিব। সব animation
                lightweight, SEO friendly, mobile এও smooth চলবে।
              </p>
              <div className="mt-6 space-y-3 text-sm">
                <label className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
                  <input type="checkbox" defaultChecked className="mt-1" />
                  <span>
                    <span className="font-bold text-emerald-800 dark:text-emerald-300">Recommended:</span> DEMO 01 + DEMO 02 +
                    DEMO 04 — Scrollytelling + Coverflow + Count-up
                    <span className="block text-xs text-slate-600 dark:text-slate-400">সবচেয়ে বেশি impact, কোড হালকা</span>
                  </span>
                </label>
                <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                  <input type="checkbox" className="mt-1" />
                  <span>
                    <span className="font-bold">Full Package:</span> 6টাই add করো — একদম Apple/Stripe level
                  </span>
                </label>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/" className={buttonStyles({ size: "lg", className: "rounded-xl" })}>
                  হোমে ফিরে দেখো <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="https://swiperjs.com/demos#effect-coverflow"
                  target="_blank"
                  rel="noreferrer"
                  className={buttonStyles({ variant: "outline", size: "lg", className: "rounded-xl" })}
                >
                  বাইরের demo আবার দেখো
                </a>
              </div>
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                Tip: এই demo page টা <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">/demo</code> — চাইলে
                শেয়ার করতে পারো।
              </p>
            </div>
            <div className="relative bg-slate-900 p-8 text-white sm:p-10">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-transparent to-amber-500/20" />
              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Before → After</p>
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Before (এখন)</p>
                    <p className="mt-1 text-sm text-slate-300">Static grid, simple fade-in, no depth</p>
                    <div className="mt-3 grid grid-cols-3 gap-2 opacity-60">
                      <div className="h-16 rounded-xl bg-white/10" />
                      <div className="h-16 rounded-xl bg-white/10" />
                      <div className="h-16 rounded-xl bg-white/10" />
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-black text-white">↓ UPGRADE ↓</span>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-amber-500/20 p-4 backdrop-blur">
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">After (আমি যা বানাব)</p>
                    <p className="mt-1 text-sm text-white">3D Coverflow + PowerPoint flip + Count-up + Tilt</p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="h-16 rounded-xl bg-white shadow-lg" />
                      <div className="h-16 scale-105 rounded-xl bg-white shadow-xl ring-2 ring-emerald-400" />
                      <div className="h-16 rounded-xl bg-white/80 shadow-lg" />
                    </div>
                  </div>
                </div>
                <p className="mt-6 text-center text-xs text-slate-400">Performance: +0.0s load • 60fps • Mobile ready</p>
              </div>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
          সব animation <span className="font-bold text-slate-700 dark:text-slate-300">prefers-reduced-motion</span> support করে —
          যাদের motion off তাদের জন্য auto static থাকবে। SEO বা speed এ কোনো প্রভাব পড়বে না।
        </p>
      </div>
    </section>
  );
}
