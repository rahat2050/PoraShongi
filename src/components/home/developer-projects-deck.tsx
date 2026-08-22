"use client";

import { CodeXml, ExternalLink, Globe, GraduationCap, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollFlipDeck } from "@/components/motion/scroll-flip-deck";
import { developer } from "@/config/developer";

type ProjectId = (typeof developer.projects)[number]["id"];

const PROJECT_ICONS: Record<ProjectId, typeof Globe> = {
  rahatverse: Globe,
  porasathi: GraduationCap,
  shantichakra: HeartPulse,
};

const PROJECT_ACCENTS = {
  rahatverse: {
    bar: "from-brand-400 via-emerald-300 to-teal-300",
    badge: "border-brand-300/30 bg-brand-400/10 text-brand-200",
    icon: "bg-brand-400/15 text-brand-200",
    glow: "bg-brand-500/20",
  },
  porasathi: {
    bar: "from-amber-400 via-orange-300 to-rose-300",
    badge: "border-amber-300/30 bg-amber-400/10 text-amber-200",
    icon: "bg-amber-400/15 text-amber-200",
    glow: "bg-amber-500/20",
  },
  shantichakra: {
    bar: "from-rose-400 via-red-400 to-pink-300",
    badge: "border-rose-300/30 bg-rose-400/10 text-rose-200",
    icon: "bg-rose-400/15 text-rose-200",
    glow: "bg-rose-500/20",
  },
} as const;

/**
 * Rahat Ahmed-এর প্রজেক্টগুলোর PowerPoint-স্টাইল scroll presentation —
 * স্ক্রল করলে প্রতিটি প্রজেক্ট 3D-তে উল্টে সামনে আসে (Keynote/Apple-এর মতো),
 * প্রতিটিতে লাইভ ডেমো, টেক স্ট্যাক ও বিস্তারিত। ScrollFlipDeck রিইউজ করে।
 */
export function DeveloperProjectsDeck() {
  return (
    <ScrollFlipDeck
      sectionId="developer-work"
      titleId="developer-work-title"
      eyebrow="রাহাত আহমেদের কাজ"
      title="প্রজেক্ট শোকেস — স্লাইডে স্লাইডে"
      description="PowerPoint-এর মতোই — স্ক্রল করলে প্রতিটি প্রজেক্ট 3D তে উল্টে সামনে আসে। প্রতিটিতে লাইভ ডেমো, টেক স্ট্যাক ও বিস্তারিত।"
      label="Developer Portfolio"
      hint="স্ক্রল করুন · swipe করুন · তীর চাপুন"
    >
      {developer.projects.map((project, index) => {
        const Icon = PROJECT_ICONS[project.id];
        const accent = PROJECT_ACCENTS[project.id];
        return (
          <article
            key={project.id}
            data-deck-slide
            data-active={index === 0 ? "true" : undefined}
            data-visible={index === 0 ? "true" : "false"}
            className="scroll-flip-slide"
            style={{
              ["--slide-offset" as string]: String(index),
              ["--slide-abs" as string]: String(index),
            }}
          >
            <div className="deck-card group relative flex h-full min-h-0 flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(150deg,#0f172a_0%,#0b1220_55%,#042f2e_150%)] p-6 shadow-[0_28px_80px_-28px_rgba(0,0,0,.65)] sm:p-8">
              <div
                className="pointer-events-none absolute -right-4 -top-10 select-none text-[9.5rem] font-black leading-none tracking-tighter text-white/[0.05]"
                aria-hidden
              >
                0{index + 1}
              </div>
              <div className={cn("pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl", accent.glow)} aria-hidden />

              <div className={cn("h-1.5 w-24 rounded-full bg-gradient-to-r", accent.bar)} aria-hidden />

              <div className="mt-6 flex items-center justify-between gap-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em]",
                    accent.badge,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {project.categoryBangla} · {project.year}
                </span>
                <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", accent.icon)}>
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
              </div>

              <h3 className="deck-title mt-6 text-3xl font-black tracking-tight text-white sm:text-4xl">
                {project.name}
              </h3>
              <p className="mt-1 text-sm font-bold text-slate-300">{project.tagline}</p>
              <p className="deck-desc mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                {project.desc}
              </p>

              <div className="deck-chips mt-4 flex flex-wrap gap-1.5">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="deck-cta mt-auto flex flex-wrap items-center gap-2.5 border-t border-white/10 pt-5">
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-0.5 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 dark:bg-white dark:text-slate-950 dark:hover:bg-brand-50"
                >
                  Live Demo
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <CodeXml className="h-4 w-4" aria-hidden />
                  GitHub
                </a>
              </div>
            </div>
          </article>
        );
      })}
    </ScrollFlipDeck>
  );
}
