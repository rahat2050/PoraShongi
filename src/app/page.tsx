import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GraduationCap, MapPin, ShieldCheck, Users } from "lucide-react";
import { siteConfig } from "@/config/site";
import { homeFeed, siteStats } from "@/lib/data/features";
import { isSupabaseConfigured } from "@/lib/env";
import { buttonStyles } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuickTeacherSearch } from "@/components/home/quick-teacher-search";
import { HomeTeacherSection } from "@/components/home/home-teacher-section";
import { LiveStatsSection, type LiveStatItem } from "@/components/home/live-stats-section";
import type { HomeFeed } from "@/types/index";

const roles = [
  { icon: GraduationCap, title: "শিক্ষার্থী", desc: "ক্লাস, বিষয়, এলাকা ও প্রয়োজন অনুযায়ী যোগ্য শিক্ষক খুঁজুন।" },
  { icon: Users, title: "অভিভাবক", desc: "সন্তানের জন্য শিক্ষক খুঁজুন এবং টিউশনের অগ্রগতি পরিচালনা করুন।" },
  { icon: ShieldCheck, title: "শিক্ষক", desc: "নিজের প্রোফাইল তৈরি করুন, শিক্ষার্থী খুঁজুন এবং সময়সূচি পরিচালনা করুন।" },
];

const steps = [
  { n: "১", title: "প্রয়োজন জানান", desc: "ক্লাস, বিষয়, এলাকা ও বাজেট লিখুন।" },
  { n: "২", title: "মিল দেখুন", desc: "আপনার প্রয়োজনের সঙ্গে সবচেয়ে বেশি মিলে এমন শিক্ষক দেখুন।" },
  { n: "৩", title: "অনুরোধ পাঠান", desc: "পছন্দের শিক্ষককে টিউশনের অনুরোধ পাঠান।" },
  { n: "৪", title: "শেখা শুরু করুন", desc: "অনুরোধ গ্রহণ হলে সময় ঠিক করুন, উপস্থিতি রাখুন ও রিভিউ দিন।" },
];

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
  const liveStats: LiveStatItem[] = [
    { key: "students", label: "সংযুক্ত শিক্ষার্থী", value: stats?.students ?? 0 },
    { key: "teachers", label: "নিবন্ধিত শিক্ষক", value: stats?.teachers ?? 0 },
    { key: "connections", label: "সফল সংযোগ", value: stats?.successful_connections ?? 0 },
    { key: "tuitions", label: "সক্রিয় টিউশন", value: stats?.open_tuitions ?? 0 },
    { key: "verified", label: "যাচাইকৃত শিক্ষক", value: stats?.verified_teachers ?? 0 },
    { key: "districts", label: "জেলা কভারেজ", value: stats?.districts ?? 0 },
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
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-brand-50 to-white dark:border-slate-700 dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <Badge variant="brand" className="mb-6">{siteConfig.branding}</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            {siteConfig.brandNameBangla}
          </h1>
          <p className="mt-3 text-xl font-semibold text-brand-700">{siteConfig.tagline}</p>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            শিক্ষার্থী ও অভিভাবকের সঙ্গে যোগ্য শিক্ষককে সহজ ও নিরাপদ উপায়ে যুক্ত করি।
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/teachers" className={buttonStyles({ size: "lg" })}>
              শিক্ষক খুঁজুন <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/leaderboard" className={buttonStyles({ variant: "outline", size: "lg" })}>
              🏆 সেরা শিক্ষক
            </Link>
            <Link href="/register" className={buttonStyles({ variant: "outline", size: "lg" })}>
              ফ্রিতে যুক্ত হোন
            </Link>
          </div>
          <p className="mt-7 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
            <MapPin className="h-4 w-4" aria-hidden />
            বাংলাদেশের যেকোনো এলাকা থেকে—ক্লাস, বিষয় ও মাধ্যম অনুযায়ী শিক্ষক খুঁজুন
          </p>

          <QuickTeacherSearch />

        </div>
      </section>

      {/* Roles */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">সবার জন্য</h2>
            <p className="mt-3 text-slate-600">শিক্ষার্থী, অভিভাবক ও শিক্ষক—সবাই একই বিশ্বস্ত প্ল্যাটফর্মে।</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {roles.map((role) => (
              <Card key={role.title} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-950/70 dark:text-brand-300">
                    <role.icon className="h-6 w-6" aria-hidden />
                  </div>
                  <CardTitle>{role.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">{role.desc}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <LiveStatsSection items={liveStats} />

      {stats && ((stats.popular_subjects?.length ?? 0) > 0 || (stats.popular_classes?.length ?? 0) > 0) && (
        <section className="border-y border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2">
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
        </section>
      )}

      <HomeTeacherSection
        title="ফিচার্ড শিক্ষক"
        description="যাচাইকৃত ও বর্তমানে ফিচার্ড শিক্ষক।"
        teachers={feed.featured_teachers}
      />
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

      {/* How it works */}
      <section id="how" className="bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">কীভাবে কাজ করে</h2>
            <p className="mt-3 text-slate-600">মাত্র ৪টি ধাপে সঠিক শিক্ষক খুঁজুন।</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.n} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-700 dark:bg-slate-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 font-bold text-white">
                  {step.n}
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="rounded-3xl bg-brand-950 px-6 py-12 text-center sm:px-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">আজই শুরু করুন</h2>
            <p className="mx-auto mt-3 max-w-2xl text-brand-100/90">
              শিক্ষক হলে প্রোফাইল খুলে শিক্ষার্থী খুঁজুন—শিক্ষার্থী হলে সঠিক শিক্ষক বেছে নিন।
            </p>
            <Link href="/register" className={buttonStyles({ size: "lg", className: "mt-8 bg-white text-brand-900 hover:bg-brand-50 dark:bg-white dark:text-brand-900 dark:hover:bg-brand-50" })}>
              ফ্রিতে যুক্ত হোন
            </Link>
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
    <div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:border-brand-500 hover:text-brand-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-400 dark:hover:text-brand-300"
          >
            {item.label}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300">{item.count}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
