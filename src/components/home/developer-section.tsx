"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Code2,
  CodeXml,
  ExternalLink,
  GraduationCap,
  Handshake,
  HeartPulse,
  Languages,
  MapPin,
  Medal,
  Quote,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { developer } from "@/config/developer";
import { Avatar } from "@/components/ui/avatar";
import { buttonStyles } from "@/components/ui/button";
import { CountUp } from "@/components/motion/count-up";
import { PointerTilt } from "@/components/motion/pointer-tilt";
import { Reveal } from "@/components/motion/reveal";
import { usePrefersReducedMotion } from "@/components/motion/reduced-motion";

const bengaliNumber = new Intl.NumberFormat("bn-BD");

const developerFacts = [
  {
    icon: Trophy,
    label: "শিক্ষা",
    value: "GPA 5.00 (দুইবার)",
    tone: "text-amber-300",
  },
  {
    icon: GraduationCap,
    label: "টিউটর",
    value: "২০২৩ সাল থেকে — PoraSathi-র অনুপ্রেরণা",
    tone: "text-brand-300",
  },
  {
    icon: Handshake,
    label: "Shantichakra Blood Society",
    value: "সহ-প্রতিষ্ঠাতা ও General Secretary (২০২৫)",
    tone: "text-rose-300",
  },
  {
    icon: ShieldCheck,
    label: "BNCC Cadet",
    value: "শৃঙ্খলা ও নেতৃত্ব",
    tone: "text-sky-300",
  },
] as const;

const developerServices = ["ওয়েব ডেভেলপমেন্ট", "পোর্টফোলিও", "ই-কমার্স", "শিক্ষা প্রতিষ্ঠান"];

export function DeveloperSection() {
  const [flipped, setFlipped] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const canFlip = !reducedMotion;

  const toggle = () => {
    if (canFlip) setFlipped((value) => !value);
  };

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!canFlip) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("a, button")) return;
    setFlipped((value) => !value);
  };

  return (
    <section
      className="relative isolate overflow-hidden border-t border-white/10 bg-slate-950 text-white"
      aria-labelledby="developer-section-title"
    >
      {/* Ambient depth */}
      <div
        className="pointer-events-none absolute inset-0 -z-20 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, black, transparent 78%)",
        }}
        aria-hidden
      />
      <div className="motion-parallax-slow pointer-events-none absolute -left-28 top-0 -z-10 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl" aria-hidden />
      <div className="motion-parallax-fast pointer-events-none absolute -right-24 bottom-0 -z-10 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" aria-hidden />

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
          {/* Copy */}
          <div className="developer-scroll-copy text-center lg:text-left">
            <Reveal direction="up">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-brand-100">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
                প্ল্যাটফর্মের নির্মাতা · Developer
              </div>

              <h2
                id="developer-section-title"
                className="mt-6 text-balance text-3xl font-black tracking-tight text-white sm:text-4xl"
              >
                এই প্ল্যাটফর্ম যিনি বানিয়েছেন
              </h2>

              <p className="mt-4 text-2xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-brand-300 via-emerald-200 to-amber-200 bg-clip-text text-transparent text-gradient-shimmer">
                  {developer.name}
                </span>
              </p>
              <p className="mt-1.5 text-sm font-bold uppercase tracking-[0.16em] text-brand-300">
                {developer.role} · {developer.byline}
              </p>
            </Reveal>

            <Reveal direction="up" delay={80}>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base lg:mx-0">
                {developer.bio}
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-300 lg:justify-start">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-brand-300" aria-hidden /> {developer.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Languages className="h-4 w-4 text-brand-300" aria-hidden /> {developer.languages.join(" · ")}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
                {developer.tech.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal direction="up" delay={160}>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <a
                  href={developer.links.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonStyles({ size: "lg", className: "motion-glow h-13 rounded-xl px-6 shadow-lg shadow-brand-900/40" })}
                >
                  পোর্টফোলিও দেখুন <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
                <a
                  href={developer.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonStyles({ variant: "outline", size: "lg", className: "motion-glow h-13 rounded-xl border-white/25 bg-white/5 px-6 text-white shadow-none hover:bg-white/10 dark:border-white/25 dark:bg-white/5 dark:text-white dark:hover:bg-white/10" })}
                >
                  <CodeXml className="h-4 w-4" aria-hidden /> GitHub
                </a>
                <a
                  href={developer.links.order}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-13 items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-bold text-brand-200 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
                >
                  একটি ওয়েবসাইট অর্ডার করুন <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
              </div>
            </Reveal>

            {/* Stats — staggered scroll reveal */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {developer.stats.map((stat, index) => (
                <Reveal key={stat.labelEn} direction="up" delay={200 + index * 90} className="h-full">
                  <div className="motion-card flex h-full flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.08] p-4 text-center">
                    <p className="text-3xl font-black tracking-tight text-white">
                      <span className="inline-flex items-baseline justify-center">
                        <CountUp value={stat.value} duration={900} format={(n) => bengaliNumber.format(n)} />
                        {stat.suffix && <span className="text-xl text-amber-300">{stat.suffix}</span>}
                      </span>
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-300">{stat.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* 3D flip profile card */}
          <div className="developer-scroll-card relative mx-auto w-full max-w-md">
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand-500/25 via-transparent to-amber-400/20 blur-2xl" aria-hidden />

            <PointerTilt className="relative" maxRotation={4.5} maxLayerOffset={12} scrollRange={10}>
              {/* Floating role badges — tilt with the card and drift gently */}
              <div
                className="motion-float pointer-events-none absolute -left-4 -top-5 z-20 flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/95 px-3.5 py-2 text-xs font-bold text-white shadow-xl sm:-left-8"
                aria-hidden
              >
                <Code2 className="h-4 w-4 text-brand-300" /> Web Developer
              </div>
              <div
                className="motion-float motion-float-delay pointer-events-none absolute -right-3 top-16 z-20 flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/95 px-3.5 py-2 text-xs font-bold text-white shadow-xl sm:-right-8"
                aria-hidden
              >
                <HeartPulse className="h-4 w-4 text-rose-400" /> Blood Donor
              </div>
              <div
                className="motion-float motion-float-delay-more pointer-events-none absolute -bottom-4 left-6 z-20 flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/95 px-3.5 py-2 text-xs font-bold text-white shadow-xl"
                aria-hidden
              >
                <ShieldCheck className="h-4 w-4 text-amber-300" /> BNCC Cadet
              </div>

              <div
                className={cn("flip-card developer-flip", canFlip && "cursor-pointer")}
                data-flipped={flipped || undefined}
                onClick={handleCardClick}
              >
                <div className="flip-inner">
                  {/* Front */}
                  <div className="flip-face flip-front">
                    <div className="btn-shine hero-motion-surface relative overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-[0_40px_100px_-40px_rgba(16,185,129,.45)] sm:p-8">
                      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/80 to-transparent" aria-hidden />

                      <div className="flex flex-col items-center text-center">
                        <div className="relative h-32 w-32 sm:h-36 sm:w-36" data-pointer-layer="0.5">
                          <div className="developer-ring absolute -inset-2 rounded-full" aria-hidden />
                          <Avatar
                            src={developer.avatarUrl}
                            name={developer.name}
                            size="xl"
                            className="relative h-full w-full text-2xl ring-4 ring-slate-950/70"
                          />
                        </div>

                        <p className="mt-5 text-xl font-black text-white">{developer.name}</p>
                        <p className="mt-1 text-sm font-bold text-brand-300">{developer.role}</p>
                        <p className="mt-1 text-xs text-slate-400">{developer.headline}</p>

                        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left">
                          <Quote className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden />
                          <div>
                            <p className="text-sm leading-6 text-slate-200">{developer.quote}</p>
                            <p className="mt-1.5 text-xs font-semibold text-slate-400">{developer.quoteByline}</p>
                          </div>
                        </div>

                        {canFlip && (
                          <button
                            type="button"
                            onClick={toggle}
                            aria-expanded={flipped}
                            aria-controls="developer-card-back"
                            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-900/30 transition-transform hover:-translate-y-0.5 hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                          >
                            <RefreshCw className="flip-hint h-4 w-4" aria-hidden />
                            বিস্তারিত দেখুন
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Back */}
                  <div
                    id="developer-card-back"
                    className="flip-face flip-back"
                    aria-hidden={!flipped}
                    inert={!flipped}
                  >
                    <div className="relative flex h-full flex-col overflow-hidden overflow-y-auto rounded-[2rem] border-2 border-amber-300/70 bg-[linear-gradient(150deg,#042f2e_0%,#0f3d3a_52%,#1f2937_100%)] p-6 text-white shadow-[0_40px_100px_-40px_rgba(16,185,129,.5)] sm:p-7">
                      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-400/15 blur-2xl" aria-hidden />
                      <div className="pointer-events-none absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-brand-400/15 blur-2xl" aria-hidden />
                      {canFlip && <span className="developer-shine" aria-hidden />}

                      <div className="dev-back-enter dev-d1 relative flex items-center gap-3">
                        <Avatar src={developer.avatarUrl} name={developer.name} size="md" />
                        <div className="min-w-0">
                          <p className="truncate text-lg font-black text-white">{developer.name}</p>
                          <p className="text-xs font-bold text-amber-300">{developer.role} · {developer.byline}</p>
                        </div>
                        {canFlip && (
                          <button
                            type="button"
                            onClick={toggle}
                            aria-expanded={flipped}
                            className="ml-auto inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 text-xs font-bold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                          >
                            <RefreshCw className="flip-hint h-3.5 w-3.5" aria-hidden /> ফিরে যান
                          </button>
                        )}
                      </div>

                      <h3 className="dev-back-enter dev-d2 relative mt-5 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-amber-300">
                        <Medal className="h-4 w-4" aria-hidden /> গুরুত্বপূর্ণ তথ্য
                      </h3>

                      <dl className="dev-back-enter dev-d3 relative mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto">
                        {developerFacts.map((fact) => (
                          <div key={fact.label} className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                            <fact.icon className={cn("mt-0.5 h-4 w-4 shrink-0", fact.tone)} aria-hidden />
                            <div className="min-w-0">
                              <dt className="text-[10px] font-bold uppercase tracking-wider text-white/60">{fact.label}</dt>
                              <dd className="text-xs font-semibold leading-5 text-white">{fact.value}</dd>
                            </div>
                          </div>
                        ))}
                      </dl>

                      <h3 className="dev-back-enter dev-d4 relative mt-4 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand-200">
                        <Rocket className="h-3.5 w-3.5" aria-hidden /> যা বানাই
                      </h3>
                      <div className="dev-back-enter dev-d4 relative mt-2 flex flex-wrap gap-1.5">
                        {developerServices.map((service) => (
                          <span key={service} className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-amber-100">
                            {service}
                          </span>
                        ))}
                      </div>

                      <div className="dev-back-enter dev-d5 relative mt-auto pt-5">
                        <div className="grid gap-2">
                          <a
                            href={developer.links.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 text-sm font-bold text-slate-950 shadow-lg shadow-amber-900/30 transition-transform hover:-translate-y-0.5 hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                          >
                            পোর্টফোলিও দেখুন <ArrowUpRight className="h-4 w-4" aria-hidden />
                          </a>
                          <div className="flex gap-2">
                            <a
                              href={developer.links.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 text-xs font-bold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                            >
                              <CodeXml className="h-3.5 w-3.5" aria-hidden /> GitHub
                            </a>
                            <a
                              href={developer.links.order}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 text-xs font-bold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                            >
                              <Rocket className="h-3.5 w-3.5" aria-hidden /> অর্ডার করুন
                            </a>
                          </div>
                        </div>
                        <p className="flip-back-hint mt-2 text-center text-[10px] text-brand-100/60">ফিরে যেতে আবার ট্যাপ করুন</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </PointerTilt>
          </div>
        </div>
      </div>
    </section>
  );
}
