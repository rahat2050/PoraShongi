import Link from "next/link";
import { ArrowUpRight, ClipboardList, GraduationCap, Send, Sparkles } from "lucide-react";
import { ScrollFlipDeck } from "@/components/motion/scroll-flip-deck";

const steps = [
  {
    n: "১",
    title: "প্রয়োজন জানান",
    desc: "ক্লাস, বিষয়, এলাকা ও বাজেট লিখুন—এক জায়গায় আপনার শেখার চাহিদা স্পষ্ট করুন।",
    href: "/dashboard/tuitions/new",
    cta: "টিউশন পোস্ট করুন",
    icon: ClipboardList,
  },
  {
    n: "২",
    title: "মিল দেখুন",
    desc: "আপনার প্রয়োজনের সঙ্গে সবচেয়ে বেশি মিলে এমন শিক্ষক দেখুন, যাচাই করুন ও তুলনা করুন।",
    href: "/teachers",
    cta: "ম্যাচ দেখুন",
    icon: Sparkles,
  },
  {
    n: "৩",
    title: "অনুরোধ পাঠান",
    desc: "পছন্দের শিক্ষককে টিউশনের অনুরোধ পাঠান। যোগাযোগ নিয়ন্ত্রিত ও নিরাপদ থাকে।",
    href: "/teachers",
    cta: "শিক্ষক বাছুন",
    icon: Send,
  },
  {
    n: "৪",
    title: "শেখা শুরু করুন",
    desc: "অনুরোধ গ্রহণ হলে সময় ঠিক করুন, উপস্থিতি রাখুন এবং শেষে রিভিউ দিন।",
    href: "/dashboard/schedule",
    cta: "সময়সূচি খুলুন",
    icon: GraduationCap,
  },
] as const;

export function HowItWorksDeck() {
  return (
    <ScrollFlipDeck
      sectionId="how"
      titleId="how-title"
      eyebrow="সহজ ও পরিষ্কার প্রক্রিয়া"
      title="চার ধাপে শেখার সঠিক সঙ্গী"
      description="প্রয়োজন জানানো থেকে সময়সূচি পরিচালনা—প্রতিটি গুরুত্বপূর্ণ কাজ একটি স্লাইড, স্ক্রল করলে 3D তে উল্টে পরের ধাপে যায়।"
      label="PoraSathi Presentation"
      hint="স্ক্রল করুন · swipe করুন · তীর চাপুন"
    >
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <article
            key={step.n}
            data-deck-slide
            data-active={index === 0 ? "true" : undefined}
            data-visible={index === 0 ? "true" : "false"}
            className="scroll-flip-slide"
            style={{
              ["--slide-offset" as string]: String(index),
              ["--slide-abs" as string]: String(index),
            }}
          >
            <Link
              href={step.href}
              data-home-action={`step-${step.n}`}
              className="deck-card group relative flex h-full min-h-0 flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_28px_80px_-28px_rgba(0,0,0,.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:p-8 dark:border-slate-600 dark:bg-slate-800"
              aria-label={`${step.title}: ${step.cta}`}
            >
              <div className="pointer-events-none absolute -right-3 -top-10 select-none text-[9.5rem] font-black leading-none tracking-tighter text-slate-200 dark:text-slate-700" aria-hidden>
                {step.n}
              </div>
              <div className="h-1.5 w-24 rounded-full bg-gradient-to-r from-brand-700 via-brand-400 to-amber-400" aria-hidden />
              <div className="deck-step-row mt-6 flex items-center justify-between gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 text-lg font-black text-white shadow-lg shadow-brand-900/25">
                  {step.n}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200">
                  <Icon className="h-3.5 w-3.5 text-brand-800 dark:text-emerald-200" aria-hidden />
                  ধাপ {step.n}
                </span>
              </div>
              <h3 className="deck-title mt-8 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl dark:text-white">{step.title}</h3>
              <p className="deck-desc mt-4 max-w-xl text-sm leading-7 text-slate-700 sm:text-base dark:text-slate-200">{step.desc}</p>
              <span className="deck-cta mt-auto inline-flex items-center justify-between gap-3 border-t border-slate-200 pt-5 text-sm font-bold text-brand-800 dark:border-slate-600 dark:text-emerald-200">
                {step.cta}
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-800 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-brand-700 group-hover:text-white dark:bg-brand-950 dark:text-brand-200">
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </span>
              </span>
            </Link>
          </article>
        );
      })}
    </ScrollFlipDeck>
  );
}
