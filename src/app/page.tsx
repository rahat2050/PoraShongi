import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, GraduationCap, ShieldCheck, Sparkles, Users } from "lucide-react";
import { siteConfig } from "@/config/site";
import { homeFeed, siteStats } from "@/lib/data/features";
import { isSupabaseConfigured } from "@/lib/env";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeroSection } from "@/components/home/hero-section";
import { VisitorJourney } from "@/components/home/visitor-journey";
import { VisitorMobileCta } from "@/components/home/visitor-mobile-cta";
import { HomeTeacherSection } from "@/components/home/home-teacher-section";
import { FeaturedCoverflow } from "@/components/home/featured-coverflow";
import { HowItWorksDeck } from "@/components/home/how-it-works-deck";
import { JourneyCoverflow } from "@/components/home/journey-coverflow";
import { LiveStatsSection, type LiveStatItem } from "@/components/home/live-stats-section";
import { PointerTilt } from "@/components/motion/pointer-tilt";
import { ScrollFan } from "@/components/motion/scroll-fan";
import type { HomeFeed } from "@/types/index";

const roles = [
  {
    key: "student",
    icon: GraduationCap,
    title: "শিক্ষার্থী",
    desc: "ক্লাস, বিষয়, এলাকা ও প্রয়োজন অনুযায়ী যোগ্য শিক্ষক খুঁজুন।",
    href: "/teachers",
    cta: "শিক্ষক দেখুন",
  },
  {
    key: "guardian",
    icon: Users,
    title: "অভিভাবক",
    desc: "সন্তানের জন্য শিক্ষক খুঁজুন এবং টিউশনের অগ্রগতি পরিচালনা করুন।",
    href: "/teachers",
    cta: "সন্তানের জন্য খুঁজুন",
  },
  {
    key: "teacher",
    icon: ShieldCheck,
    title: "শিক্ষক",
    desc: "নিজের প্রোফাইল তৈরি করুন, শিক্ষার্থী খুঁজুন এবং সময়সূচি পরিচালনা করুন।",
    href: "/tuitions",
    cta: "টিউশন সুযোগ দেখুন",
  },
] as const;

export const metadata: Metadata = { alternates: { canonical: "/" } };
export const revalidate = 300;

export default async function Home() {
  const emptyFeed: HomeFeed = {
    teachers: [],
    featured_teachers: [],
    recent_teachers: [],
    tuitions: [],
  };
  let feed = emptyFeed;
  let stats: import("@/lib/data/features").SiteStats | null = null;
  if (isSupabaseConfigured()) {
    const [feedRes, statsRes] = await Promise.all([homeFeed(), siteStats()]);
    const value = feedRes.data;
    feed = {
      teachers: value?.teachers ?? [],
      featured_teachers: value?.featured_teachers ?? [],
      recent_teachers: value?.recent_teachers ?? [],
      tuitions: [],
    };
    stats = statsRes.data;
  }

  const featuredIds = new Set(feed.featured_teachers.map((teacher) => teacher.id));
  const topTeachers = feed.teachers.filter((teacher) => !featuredIds.has(teacher.id));
  const shownIds = new Set([...featuredIds, ...topTeachers.map((teacher) => teacher.id)]);
  const recentTeachers = feed.recent_teachers.filter((teacher) => !shownIds.has(teacher.id));
  const heroTeacher = feed.featured_teachers[0] ?? feed.teachers[0] ?? feed.recent_teachers[0] ?? null;
  const liveStats: LiveStatItem[] = [
    { key: "students", label: "সংযুক্ত শিক্ষার্থী", value: stats?.students ?? 0, href: "/register", actionLabel: "শিক্ষার্থী হিসেবে যুক্ত হোন" },
    { key: "teachers", label: "নিবন্ধিত শিক্ষক", value: stats?.teachers ?? 0, href: "/teachers", actionLabel: "শিক্ষক দেখুন" },
    { key: "connections", label: "সফল সংযোগ", value: stats?.successful_connections ?? 0, href: "/safety", actionLabel: "নিরাপদ সংযোগ জানুন" },
    { key: "tuitions", label: "সক্রিয় টিউশন", value: stats?.open_tuitions ?? 0, href: "/tuitions", actionLabel: "টিউশন দেখুন" },
    { key: "verified", label: "যাচাইকৃত শিক্ষক", value: stats?.verified_teachers ?? 0, href: "/teachers?verified=1", actionLabel: "যাচাইকৃত শিক্ষক দেখুন" },
    { key: "districts", label: "জেলা কভারেজ", value: stats?.districts ?? 0, href: "/teachers", actionLabel: "এলাকাভিত্তিক খুঁজুন" },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        name: siteConfig.brandName,
        alternateName: siteConfig.brandNameBangla,
        url: siteConfig.url,
        logo: `${siteConfig.url}/icon-512.png`,
        email: "hello@porasathi.com",
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        name: siteConfig.brandName,
        url: siteConfig.url,
        inLanguage: "bn-BD",
        publisher: { "@id": `${siteConfig.url}/#organization` },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <HeroSection teacher={heroTeacher} />
      <VisitorJourney />
      <JourneyCoverflow />
      <VisitorMobileCta />

      {/* Role-based entry points */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900" aria-labelledby="role-entry-title">
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl dark:bg-brand-900/10" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
          <div className="grid items-end gap-6 lg:grid-cols-[1fr_.7fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">আপনার জন্য তৈরি</p>
              <h2 id="role-entry-title" className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl dark:text-white">
                যে ভূমিকাতেই থাকুন, সঠিক কাজটি দিয়ে শুরু করুন
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-slate-600 lg:justify-self-end dark:text-slate-300">
              শিক্ষার্থী, অভিভাবক ও শিক্ষক—প্রত্যেকের জন্য আলাদা যাত্রা, কিন্তু প্রয়োজনীয় সবকিছু একই বিশ্বস্ত প্ল্যাটফর্মে।
            </p>
          </div>

          <ScrollFan className="mt-12 grid gap-5 md:grid-cols-3">
            {roles.map((role, index) => (
              <PointerTilt key={role.key} maxRotation={5} maxLayerOffset={10} className="group h-full rounded-[1.75rem]">
                <Link
                  href={role.href}
                  data-home-action={`role-${role.key}`}
                  className="block rounded-[1.75rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-4"
                  aria-label={`${role.title}: ${role.cta}`}
                >
                  <Card className="relative flex min-h-80 h-full flex-col overflow-hidden rounded-[1.75rem] border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 shadow-[0_18px_50px_-34px_rgba(15,23,42,.45)] transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-brand-300 group-hover:shadow-[0_28px_70px_-34px_rgba(15,118,110,.45)] dark:border-slate-700 dark:from-slate-800 dark:to-slate-900 dark:group-hover:border-brand-700">
                    <div className="h-1.5 w-full bg-gradient-to-r from-brand-700 via-brand-400 to-amber-400 opacity-70 transition-opacity group-hover:opacity-100" aria-hidden />
                    <CardHeader className="border-0 pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div
                          data-pointer-layer="0.4"
                          className="pointer-tilt-layer flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-200 bg-brand-50 text-brand-800 shadow-sm transition-all group-hover:-rotate-3 group-hover:bg-brand-700 group-hover:text-white dark:border-brand-800 dark:bg-brand-950/70 dark:text-brand-300 dark:group-hover:bg-brand-700 dark:group-hover:text-white"
                        >
                          <role.icon className="h-7 w-7" aria-hidden />
                        </div>
                        <span
                          data-pointer-layer="0.25"
                          className="pointer-tilt-layer text-4xl font-black tracking-tighter text-slate-200 dark:text-slate-700"
                        >
                          0{index + 1}
                        </span>
                      </div>
                      <CardTitle
                        data-pointer-layer="0.3"
                        className="pointer-tilt-layer mt-5 text-2xl transition-colors group-hover:text-brand-800 dark:group-hover:text-brand-300"
                      >
                        {role.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col pt-0 text-sm leading-7 text-slate-600 dark:text-slate-300">
                      <p data-pointer-layer="0.2" className="pointer-tilt-layer">
                        {role.desc}
                      </p>
                      <span
                        data-pointer-layer="0.35"
                        className="pointer-tilt-layer mt-auto inline-flex items-center justify-between gap-3 border-t border-slate-200 pt-5 font-bold text-brand-800 dark:border-slate-700 dark:text-brand-300"
                      >
                        {role.cta}
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 transition-all group-hover:bg-brand-700 group-hover:text-white dark:bg-brand-950">
                          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                        </span>
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </PointerTilt>
            ))}
          </ScrollFan>
        </div>
      </section>

      <LiveStatsSection items={liveStats} />

      {stats && ((stats.popular_subjects?.length ?? 0) > 0 || (stats.popular_classes?.length ?? 0) > 0) && (
        <section className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950" aria-labelledby="popular-discovery-title">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <Sparkles className="h-5 w-5" aria-hidden />
              </span>
              <h2 id="popular-discovery-title" className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white">এখন যা বেশি খোঁজা হচ্ছে</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">বর্তমান শিক্ষক ও টিউশন তথ্য থেকে জনপ্রিয় বিষয় ও ক্লাস দেখুন।</p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              <DiscoveryLinks
                title="জনপ্রিয় বিষয়"
                items={(stats.popular_subjects ?? []).map((item) => ({
                  label: item.subject,
                  count: item.count,
                  href: `/teachers?subject=${encodeURIComponent(item.subject)}`,
                }))}
              />
              <DiscoveryLinks
                title="জনপ্রিয় ক্লাস"
                items={(stats.popular_classes ?? []).map((item) => ({
                  label: item.class_level,
                  count: item.count,
                  href: `/teachers?class=${encodeURIComponent(item.class_level)}`,
                }))}
              />
            </div>
          </div>
        </section>
      )}

      {feed.featured_teachers.length > 0 && (
        <FeaturedCoverflow teachers={feed.featured_teachers} title="ফিচার্ড শিক্ষক" description="যাচাইকৃত ও বর্তমানে ফিচার্ড শিক্ষক — 3D তে swipe করে দেখুন।" />
      )}
      <HomeTeacherSection
        title="সেরা রেটিংয়ের শিক্ষক"
        description="যাচাইকৃত রিভিউ ও রেটিং অনুযায়ী নির্বাচিত শিক্ষক।"
        teachers={topTeachers}
        viewAllHref="/leaderboard"
        tone="muted"
      />
      <HomeTeacherSection
        title="নতুন যোগ দেওয়া শিক্ষক"
        description="সম্প্রতি সম্পূর্ণ করে প্রকাশ করা শিক্ষক প্রোফাইল।"
        teachers={recentTeachers}
      />

      <HowItWorksDeck />

      {/* Final CTA */}
      <section className="bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="motion-reveal motion-glow relative isolate overflow-hidden rounded-[2rem] border border-brand-700/50 bg-[linear-gradient(135deg,#042f2e_0%,#115e59_58%,#0f766e_100%)] px-6 py-12 shadow-[0_30px_90px_-40px_rgba(4,47,46,.8)] sm:px-10 lg:px-14 lg:py-14">
            <div className="pointer-events-none absolute -right-20 -top-28 -z-10 h-80 w-80 rounded-full border-[48px] border-white/5" aria-hidden />
            <div className="pointer-events-none absolute -bottom-36 left-1/3 -z-10 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute right-10 top-8 hidden gap-3 lg:flex" aria-hidden>
              <span className="motion-float rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-[11px] font-bold text-brand-50 backdrop-blur">Discover</span>
              <span className="motion-float motion-float-delay rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-[11px] font-bold text-amber-100 backdrop-blur">Match</span>
              <span className="motion-float motion-float-delay-more rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-[11px] font-bold text-white/90 backdrop-blur">Connect</span>
            </div>
            <div className="grid items-center gap-9 lg:grid-cols-[1fr_auto]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-brand-100 backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden /> আজই আপনার যাত্রা শুরু করুন
                </span>
                <h2 className="mt-5 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-4xl">শিক্ষক খোঁজা থেকে শেখা পরিচালনা—সব এক জায়গায়</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-brand-50/85 sm:text-base">
                  শিক্ষার্থী ও অভিভাবক শিক্ষক খুঁজুন, শিক্ষকরা টিউশন সুযোগ দেখুন—তারপর নিরাপদভাবে সংযোগ ও সময়সূচি পরিচালনা করুন।
                </p>
              </div>
              <div className="flex min-w-56 flex-col gap-3">
                <Link href="/register" className={buttonStyles({ size: "lg", className: "rounded-xl bg-white text-brand-950 shadow-lg hover:bg-brand-50 focus-visible:ring-white dark:bg-white dark:text-brand-950 dark:hover:bg-brand-50" })}>
                  ফ্রিতে যুক্ত হোন <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link href="/teachers" className={buttonStyles({ variant: "outline", size: "lg", className: "rounded-xl border-white/25 bg-white/10 text-white shadow-none hover:bg-white/15 focus-visible:ring-white dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/15" })}>
                  আগে শিক্ষক দেখুন
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
function DiscoveryLinks({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; count: number; href: string }>;
}) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-36px_rgba(15,23,42,.5)] sm:p-6 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{items.length}টি ক্যাটাগরি</span>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex min-h-12 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-700 transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-700 dark:hover:bg-brand-950/50 dark:hover:text-brand-300"
          >
            <span className="min-w-0 truncate">{item.label}</span>
            <span className="flex shrink-0 items-center gap-1.5">
              <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-600 shadow-sm dark:bg-slate-700 dark:text-slate-300">{item.count}</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-700 dark:group-hover:text-brand-300" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
