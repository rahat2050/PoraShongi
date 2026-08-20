import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck2,
  CheckCircle2,
  Handshake,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { Avatar } from "@/components/ui/avatar";
import { buttonStyles } from "@/components/ui/button";
import { QuickTeacherSearch } from "@/components/home/quick-teacher-search";
import { PointerTilt } from "@/components/motion/pointer-tilt";
import type { TeacherPublic } from "@/types/index";

const journey = [
  {
    key: "discover",
    label: "Discover",
    description: "প্রয়োজন অনুযায়ী শিক্ষক খুঁজুন",
    href: "/teachers",
    icon: Search,
  },
  {
    key: "match",
    label: "Match",
    description: "ফিল্টার দিয়ে সেরা মিল দেখুন",
    href: "/teachers?sort=relevance",
    icon: Sparkles,
  },
  {
    key: "connect",
    label: "Connect",
    description: "নিরাপদে অনুরোধ পাঠান",
    href: "/teachers",
    icon: Handshake,
  },
  {
    key: "manage",
    label: "Manage",
    description: "সময় ও সেশন পরিচালনা করুন",
    href: "/dashboard/schedule",
    icon: CalendarCheck2,
  },
  {
    key: "trust",
    label: "Trust",
    description: "ভেরিফিকেশন ও নিরাপত্তা জানুন",
    href: "/safety",
    icon: ShieldCheck,
  },
] as const;

const trustPoints = [
  "লগইন ছাড়াই শিক্ষক দেখুন",
  "নিয়ন্ত্রিত অনুরোধ ও যোগাযোগ",
  "মেসেজ ও সময়সূচি এক জায়গায়",
] as const;

export function HeroSection({ teacher = null }: { teacher?: TeacherPublic | null }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-slate-200/80 bg-[linear-gradient(135deg,#f0fdfa_0%,#ffffff_46%,#fffbeb_100%)] dark:border-slate-700 dark:bg-[linear-gradient(135deg,#020617_0%,#0f172a_52%,#042f2e_100%)]">
      <div
        className="pointer-events-none absolute inset-0 -z-20 opacity-35 dark:opacity-15"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,118,110,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(15,118,110,.12) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "linear-gradient(to bottom, black, transparent 86%)",
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute -left-32 top-24 -z-10 h-80 w-80 rounded-full bg-brand-200/50 blur-3xl dark:bg-brand-800/20" aria-hidden />
      <div className="pointer-events-none absolute -right-24 top-10 -z-10 h-96 w-96 rounded-full bg-amber-200/45 blur-3xl dark:bg-amber-700/10" aria-hidden />

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          <div className="hero-copy-enter text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3.5 py-2 text-xs font-semibold text-brand-800 shadow-sm backdrop-blur dark:border-brand-800 dark:bg-slate-900/70 dark:text-brand-200">
              <span className="h-2 w-2 rounded-full bg-brand-500" aria-hidden />
              বাংলাদেশের টিউশন মার্কেটপ্লেস
            </div>

            <h1 className="mt-6 text-balance text-4xl font-black leading-[1.12] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
              সঠিক শিক্ষক খুঁজুন,
              <span className="mt-1 block bg-gradient-to-r from-brand-700 via-emerald-600 to-teal-500 bg-clip-text text-transparent text-gradient-shimmer dark:from-brand-300 dark:via-emerald-300 dark:to-amber-300">
                শেখার পথ সহজ করুন
              </span>
            </h1>
            <p className="mt-5 text-lg font-semibold text-brand-800 dark:text-brand-200">{siteConfig.tagline}</p>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg lg:mx-0 dark:text-slate-300">
              ক্লাস, বিষয়, এলাকা ও মাধ্যম অনুযায়ী শিক্ষক খুঁজুন। পছন্দের শিক্ষককে অনুরোধ পাঠিয়ে পুরো টিউশন যাত্রা একই জায়গা থেকে পরিচালনা করুন।
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link href="/teachers" className={buttonStyles({ size: "lg", className: "motion-glow h-13 rounded-xl px-7 shadow-lg shadow-brand-900/15" })}>
                শিক্ষক খুঁজুন <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/tuitions" className={buttonStyles({ variant: "outline", size: "lg", className: "motion-glow h-13 rounded-xl border-slate-300 bg-white/80 px-7 backdrop-blur dark:bg-slate-900/70" })}>
                টিউশন সুযোগ দেখুন
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-slate-600 lg:justify-start dark:text-slate-300">
              {trustPoints.map((point) => (
                <span key={point} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-brand-600 dark:text-brand-300" aria-hidden />
                  {point}
                </span>
              ))}
            </div>
          </div>

          <div className="hero-stage-enter relative mx-auto w-full max-w-xl lg:mx-0 lg:justify-self-end" data-hero-motion>
            <div className="pointer-events-none absolute -inset-5 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand-300/35 via-white/10 to-amber-300/30 blur-2xl dark:from-brand-700/25 dark:to-amber-600/10" aria-hidden />
            <PointerTilt className="relative" maxRotation={3.75} maxLayerOffset={11} scrollRange={10}>
              <div
                className="pointer-tilt-layer pointer-events-none absolute -right-3 top-20 z-20 hidden items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-2 text-[11px] font-bold text-brand-800 shadow-lg backdrop-blur xl:flex dark:border-slate-700 dark:bg-slate-900/90 dark:text-brand-200"
                data-pointer-layer="0.8"
                aria-hidden
              >
                <ShieldCheck className="h-3.5 w-3.5" /> নিরাপদ সংযোগ
              </div>
              <div className="hero-motion-surface relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-3 shadow-[0_32px_90px_-34px_rgba(4,47,46,.45)] backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/85">
                <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/80 to-transparent" aria-hidden />
                <div className="flex items-center justify-between border-b border-slate-200/80 px-3 pb-3 pt-1 dark:border-slate-700">
                  <div className="flex items-center gap-2.5">
                    <span className="pointer-tilt-layer flex h-9 w-9 items-center justify-center rounded-xl bg-brand-800 text-white shadow-sm" data-pointer-layer="0.35">
                      <Sparkles className="h-4 w-4 text-amber-300" aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">PoraSathi Journey</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">শুরু থেকে শেখা—একটি পরিষ্কার প্রবাহে</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-800 dark:bg-brand-950 dark:text-brand-200">৫টি ধাপ</span>
                </div>

                <div className="space-y-2 p-2 pt-3">
                  {journey.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        data-journey-step={item.key}
                        className="group flex min-h-16 items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5 transition-all hover:border-brand-200 hover:bg-brand-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:hover:border-brand-800 dark:hover:bg-brand-950/40"
                        aria-label={`${item.label}: ${item.description}`}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-brand-800 transition-colors group-hover:bg-brand-700 group-hover:text-white dark:bg-slate-800 dark:text-brand-300 dark:group-hover:bg-brand-700 dark:group-hover:text-white">
                          <Icon className="h-[18px] w-[18px]" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1 text-left">
                          <span className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">{item.label}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">0{index + 1}</span>
                          </span>
                          <span className="mt-0.5 block text-sm font-medium text-slate-700 dark:text-slate-200">{item.description}</span>
                        </span>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-700 dark:text-slate-400 dark:group-hover:text-brand-300" aria-hidden />
                      </Link>
                    );
                  })}
                </div>

                {teacher ? <HeroTeacherSpotlight teacher={teacher} /> : <HeroTeacherEmptyState />}

                <div className="mx-2 mb-2 mt-2 flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-3 text-left text-white dark:bg-brand-950">
                  <div>
                    <p className="text-xs font-semibold text-brand-200">Discover → Match → Connect</p>
                    <p className="mt-0.5 text-[11px] text-slate-300">Manage → Trust</p>
                  </div>
                  <Link href="/register" className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-900 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
                    শুরু করুন
                  </Link>
                </div>
              </div>
            </PointerTilt>
          </div>
        </div>

        <QuickTeacherSearch />
      </div>
    </section>
  );
}

function HeroTeacherSpotlight({ teacher }: { teacher: TeacherPublic }) {
  const name = teacher.display_name || teacher.full_name || "শিক্ষক";
  const location = [teacher.area, teacher.district].filter(Boolean).join(", ");
  const hasPublishedRating = Boolean(teacher.review_count && teacher.review_count > 0 && teacher.rating_avg != null);

  return (
    <Link
      href={`/teachers/${teacher.id}`}
      data-hero-teacher
      data-pointer-layer="0.55"
      className="pointer-tilt-layer group mx-2 mb-2 flex items-center gap-3 rounded-2xl border border-brand-200/80 bg-gradient-to-r from-brand-50 via-white to-amber-50 p-3 text-left shadow-[0_16px_38px_-26px_rgba(15,118,110,.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:border-brand-800 dark:from-brand-950/70 dark:via-slate-900 dark:to-amber-950/30"
      aria-label={`${name}-এর শিক্ষক প্রোফাইল দেখুন`}
    >
      <Avatar src={teacher.avatar_url} name={name} size="lg" className="h-14 w-14 border-2 border-white shadow-sm dark:border-slate-700" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-bold text-slate-900 dark:text-white">{name}</span>
          {teacher.verification_status === "verified" && (
            <BadgeCheck className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" aria-label="যাচাইকৃত শিক্ষক" />
          )}
        </span>
        <span className="mt-0.5 block truncate text-xs text-slate-600 dark:text-slate-300">
          {teacher.headline || teacher.education || "টিউশন শিক্ষক"}
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
          {location && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0 text-brand-700 dark:text-brand-300" aria-hidden />
              <span className="max-w-28 truncate">{location}</span>
            </span>
          )}
          {hasPublishedRating && (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-500" aria-hidden />
              {teacher.rating_avg} ({teacher.review_count})
            </span>
          )}
          {teacher.subjects?.[0] && <span className="truncate text-brand-800 dark:text-brand-200">{teacher.subjects[0]}</span>}
        </span>
      </span>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-800 shadow-sm transition-transform group-hover:translate-x-0.5 dark:bg-slate-800 dark:text-brand-200">
        <ArrowUpRight className="h-4 w-4" aria-hidden />
      </span>
    </Link>
  );
}

function HeroTeacherEmptyState() {
  return (
    <div
      data-hero-teacher-empty
      data-pointer-layer="0.35"
      className="pointer-tilt-layer mx-2 mb-2 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-3 text-left dark:border-slate-700 dark:bg-slate-950/60"
    >
      <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">প্রকাশিত শিক্ষক প্রোফাইল পাওয়া গেলে এখানে দেখা যাবে।</p>
      <Link href="/teachers" className="shrink-0 text-xs font-bold text-brand-800 hover:underline dark:text-brand-300">তালিকা দেখুন</Link>
    </div>
  );
}
