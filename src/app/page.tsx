import Link from "next/link";
import { ArrowRight, GraduationCap, MapPin, ShieldCheck, Star, Users } from "lucide-react";
import { siteConfig } from "@/config/site";
import { homeFeed, siteStats } from "@/lib/data/features";
import { isSupabaseConfigured } from "@/lib/env";
import { buttonStyles } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { formatTaka } from "@/lib/utils";

const roles = [
  { icon: GraduationCap, title: "শিক্ষার্থী", desc: "নিজের জন্য যোগ্য শিক্ষক খুঁজুন — class, subject, বাজেট ও এলাকা অনুযায়ী।" },
  { icon: Users, title: "অভিভাবক", desc: "সন্তানের জন্য শিক্ষক খুঁজুন এবং তার tuition journey manage করুন।" },
  { icon: ShieldCheck, title: "শিক্ষক", desc: "নিজের profile তৈরি করুন, tuition/student খুঁজুন, schedule manage করুন।" },
];

const steps = [
  { n: "১", title: "প্রয়োজন দিন", desc: "কোন class, কোন subject, কোন এলাকা, কত বাজেট — লিখুন।" },
  { n: "২", title: "Match পান", desc: "সিস্টেম আপনার সাথে সবচেয়ে compatible শিক্ষক দেখাবে (যেমন ৯৫% Match)।" },
  { n: "৩", title: "Request করুন", desc: "পছন্দের শিক্ষককে tuition request পাঠান।" },
  { n: "৪", title: "শেখা শুরু", desc: "Accept হলে schedule ঠিক করুন, attendance আর review দিন।" },
];

export const dynamic = "force-dynamic";

export default async function Home() {
  // Live feed — Supabase configure থাকলে top teachers + recent tuition দেখায়
  let feed: { teachers: import("@/types/index").TeacherPublic[]; tuitions: import("@/types/index").TuitionPublic[] } = {
    teachers: [],
    tuitions: [],
  };
  let stats: import("@/lib/data/features").SiteStats | null = null;
  if (isSupabaseConfigured()) {
    const [feedRes, statsRes] = await Promise.all([homeFeed(), siteStats()]);
    feed = feedRes.data ?? { teachers: [], tuitions: [] };
    stats = statsRes.data;
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <Badge variant="brand" className="mb-6">{siteConfig.branding}</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            {siteConfig.brandNameBangla}
          </h1>
          <p className="mt-3 text-xl font-semibold text-brand-700">{siteConfig.tagline}</p>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            শিক্ষার্থী/অভিভাবক আর যোগ্য শিক্ষককে যুক্ত করি — trusted, সহজ ও নিরাপদ উপায়ে।
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
          <p className="mt-7 inline-flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="h-4 w-4" aria-hidden />
            বাংলাদেশের যেকোনো এলাকা থেকে — কাছের শিক্ষক খুঁজুন
          </p>

          {stats && (
            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { value: stats.teachers, label: "শিক্ষক" },
                { value: stats.students, label: "শিক্ষার্থী" },
                { value: stats.open_tuitions, label: "খোলা tuition" },
                { value: stats.districts, label: "জেলা" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-brand-100 bg-white/70 px-4 py-3 backdrop-blur">
                  <p className="text-2xl font-extrabold text-brand-700">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Roles */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">সবার জন্য</h2>
            <p className="mt-3 text-slate-600">শিক্ষার্থী, অভিভাবক আর শিক্ষক — সবাই এক trusted প্ল্যাটফর্মে।</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {roles.map((role) => (
              <Card key={role.title} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
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

      {/* Live: সেরা শিক্ষক */}
      {feed.teachers.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">সেরা শিক্ষক</h2>
              <Link href="/leaderboard" className="text-sm font-medium text-brand-700 hover:underline">সব দেখুন →</Link>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {feed.teachers.slice(0, 6).map((t) => {
                const name = t.display_name || t.full_name || "শিক্ষক";
                return (
                  <Link key={t.id} href={`/teachers/${t.id}`} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md">
                    <Avatar src={t.avatar_url} name={name} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-semibold text-slate-800">{name}</p>
                        {t.is_premium && <Badge variant="accent">★</Badge>}
                      </div>
                      <p className="truncate text-xs text-slate-500">{t.subjects?.slice(0, 3).join(", ") || "শিক্ষক"}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden />
                        {t.review_count ? `${t.rating_avg} (${t.review_count})` : "নতুন"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Live: সাম্প্রতিক tuition */}
      {feed.tuitions.length > 0 && (
        <section>
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">সাম্প্রতিক tuition</h2>
              <Link href="/tuitions" className="text-sm font-medium text-brand-700 hover:underline">সব দেখুন →</Link>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {feed.tuitions.slice(0, 6).map((t) => (
                <Link key={t.id} href={`/tuitions/${t.id}`} className="rounded-2xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md">
                  <p className="truncate text-sm font-semibold text-slate-800">{t.title}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Badge variant="brand">{t.class_level}</Badge>
                    <Badge variant="outline">{t.subject}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{[t.area, t.district].filter(Boolean).join(", ") || "এলাকা নেই"}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">{formatTaka(t.budget)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section id="how" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">কীভাবে কাজ করে</h2>
            <p className="mt-3 text-slate-600">মাত্র ৪টা ধাপে সঠিক শিক্ষক।</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.n} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
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
              শিক্ষক হলে profile খুলে student খুঁজুন — শিক্ষার্থী হলে সঠিক শিক্ষক খুঁজে নিন।
            </p>
            <Link href="/register" className={buttonStyles({ size: "lg", className: "mt-8 bg-white text-brand-900 hover:bg-brand-50" })}>
              ফ্রিতে যুক্ত হোন
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
