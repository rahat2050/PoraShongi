"use client";

import {
  ArrowUpRight,
  Code2,
  CodeXml,
  ExternalLink,
  HeartPulse,
  Languages,
  MapPin,
  Quote,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { developer } from "@/config/developer";
import { Avatar } from "@/components/ui/avatar";
import { buttonStyles } from "@/components/ui/button";
import { CountUp } from "@/components/motion/count-up";
import { PointerTilt } from "@/components/motion/pointer-tilt";
import { Reveal } from "@/components/motion/reveal";

const bengaliNumber = new Intl.NumberFormat("bn-BD");

function ExternalLinkCta({
  href,
  className,
  children,
  icon,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
      {icon}
    </a>
  );
}

export function DeveloperSection() {
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
          <Reveal direction="up">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-brand-100 backdrop-blur">
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

              {/* Tech stack */}
              <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
                {developer.tech.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {developer.stats.map((stat) => (
                  <div
                    key={stat.labelEn}
                    className="motion-card rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-center backdrop-blur"
                  >
                    <p className="text-3xl font-black tracking-tight text-white">
                      <span className="inline-flex items-baseline justify-center">
                        <CountUp value={stat.value} duration={900} format={(n) => bengaliNumber.format(n)} />
                        {stat.suffix && <span className="text-xl text-amber-300">{stat.suffix}</span>}
                      </span>
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-300">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <ExternalLinkCta
                  href={developer.links.portfolio}
                  className={buttonStyles({ size: "lg", className: "motion-glow h-13 rounded-xl px-6 shadow-lg shadow-brand-900/40" })}
                  icon={<ExternalLink className="h-4 w-4" aria-hidden />}
                >
                  পোর্টফোলিও দেখুন
                </ExternalLinkCta>
                <ExternalLinkCta
                  href={developer.links.github}
                  className={buttonStyles({ variant: "outline", size: "lg", className: "motion-glow h-13 rounded-xl border-white/25 bg-white/5 px-6 text-white shadow-none hover:bg-white/10 dark:border-white/25 dark:bg-white/5 dark:text-white dark:hover:bg-white/10" })}
                  icon={<CodeXml className="h-4 w-4" aria-hidden />}
                >
                  GitHub
                </ExternalLinkCta>
                <ExternalLinkCta
                  href={developer.links.order}
                  className="inline-flex min-h-13 items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-bold text-brand-200 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
                  icon={<ArrowUpRight className="h-4 w-4" aria-hidden />}
                >
                  একটি ওয়েবসাইট অর্ডার করুন
                </ExternalLinkCta>
              </div>
            </div>
          </Reveal>

          {/* 3D profile card */}
          <Reveal direction="none" delay={120}>
            <div className="relative mx-auto w-full max-w-md">
              <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand-500/25 via-transparent to-amber-400/20 blur-2xl" aria-hidden />

              <PointerTilt className="relative" maxRotation={4.5} maxLayerOffset={12} scrollRange={10}>
                {/* Floating role badges — tilt with the card and drift gently */}
                <div
                  className="motion-float pointer-events-none absolute -left-4 -top-5 z-20 flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/90 px-3.5 py-2 text-xs font-bold text-white shadow-xl backdrop-blur sm:-left-8"
                  aria-hidden
                >
                  <Code2 className="h-4 w-4 text-brand-300" /> Web Developer
                </div>
                <div
                  className="motion-float motion-float-delay pointer-events-none absolute -right-3 top-16 z-20 flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/90 px-3.5 py-2 text-xs font-bold text-white shadow-xl backdrop-blur sm:-right-8"
                  aria-hidden
                >
                  <HeartPulse className="h-4 w-4 text-rose-400" /> Blood Donor
                </div>
                <div
                  className="motion-float motion-float-delay-more pointer-events-none absolute -bottom-4 left-6 z-20 flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/90 px-3.5 py-2 text-xs font-bold text-white shadow-xl backdrop-blur"
                  aria-hidden
                >
                  <ShieldCheck className="h-4 w-4 text-amber-300" /> BNCC Cadet
                </div>

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

                    <a
                      href={developer.links.about}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-brand-200 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
                    >
                      {developer.nameBangla} সম্পর্কে আরও জানুন
                      <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </a>
                  </div>
                </div>
              </PointerTilt>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
