import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Clock,
  MapPin,
  Monitor,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RatingStars } from "@/components/shared/rating-stars";
import { getPublicGig } from "@/lib/data/gigs";
import { isSupabaseConfigured } from "@/lib/env";
import { teacherProfilePath } from "@/config/seo";
import { buildPageMetadata, noIndexMetadata } from "@/lib/seo/metadata";
import { formatTaka, isUuid, modeLabel } from "@/lib/utils";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isUuid(id)) return noIndexMetadata("প্যাকেজ");
  if (!isSupabaseConfigured()) return noIndexMetadata("প্যাকেজ");

  const result = await getPublicGig(id);
  const gig = result.data;
  if (result.error || !gig) return noIndexMetadata("প্যাকেজ");

  const teacherName = gig.teacher_display_name || gig.teacher_full_name || "শিক্ষক";
  return buildPageMetadata({
    title: `${gig.title} — ${teacherName} | PoraSathi`,
    description: `${gig.title} · ${formatTaka(gig.price)}, ${gig.duration_weeks} সপ্তাহ, সপ্তাহে ${gig.sessions_per_week} ক্লাস। ${gig.description.slice(0, 110)}`,
    path: `/gigs/${gig.id}`,
    ogType: "website",
  });
}

export default async function GigDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  if (!isSupabaseConfigured()) notFound();

  const result = await getPublicGig(id);
  const gig = result.data;
  // draft/hidden/removed হলে RPC null দেয় → 404 (অস্তিত্ব ফাঁস না করা)
  if (!gig) notFound();

  const teacherName = gig.teacher_display_name || gig.teacher_full_name || "শিক্ষক";
  const totalSessions = gig.duration_weeks * gig.sessions_per_week;
  const perSession = totalSessions > 0 ? Math.round(gig.price / totalSessions) : 0;
  const place = [gig.teacher_area, gig.teacher_district].filter(Boolean).join(", ");

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: gig.title,
          description: gig.description,
          provider: {
            "@type": "Person",
            name: teacherName,
            url: teacherProfilePath(gig.teacher_id),
          },
          areaServed: place || "Bangladesh",
          offers: {
            "@type": "Offer",
            price: gig.price,
            priceCurrency: "BDT",
          },
        }}
      />

      <Breadcrumbs
        items={[
          { name: "হোম", path: "/" },
          { name: "শিক্ষক প্যাকেজ", path: "/gigs" },
          { name: gig.title },
        ]}
      />

      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{gig.title}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {gig.teacher_verification_status === "verified" ? (
          <Badge variant="success">
            <BadgeCheck className="h-3 w-3" aria-hidden /> যাচাইকৃত শিক্ষক
          </Badge>
        ) : null}
        {gig.includes_trial ? <Badge variant="accent">প্রথম ক্লাস ফ্রি ট্রায়াল</Badge> : null}
        {gig.teacher_institution ? <Badge variant="outline">{gig.teacher_institution}</Badge> : null}
      </div>

      <Card className="mt-6">
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <Avatar src={gig.teacher_avatar} name={teacherName} size="lg" />
          <div className="min-w-0 flex-1">
            <Link
              href={teacherProfilePath(gig.teacher_id)}
              className="text-lg font-bold text-slate-900 hover:text-brand-700 dark:text-slate-100"
            >
              {teacherName}
            </Link>
            {gig.teacher_headline ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">{gig.teacher_headline}</p>
            ) : null}
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              {gig.teacher_rating_avg ? (
                <span className="inline-flex items-center gap-1.5">
                  <RatingStars rating={Math.round(gig.teacher_rating_avg)} size="sm" />
                  {gig.teacher_review_count}টি রিভিউ
                </span>
              ) : (
                <span>এখনো রিভিউ নেই</span>
              )}
              {gig.teacher_experience_years != null ? (
                <span>{gig.teacher_experience_years} বছর অভিজ্ঞতা</span>
              ) : null}
              {place ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" aria-hidden /> {place}
                </span>
              ) : null}
            </div>
          </div>
          <Link href={teacherProfilePath(gig.teacher_id)} className={buttonStyles()}>
            প্রোফাইল দেখুন
          </Link>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">প্যাকেজে যা থাকছে</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
            {gig.description}
          </p>

          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <Wallet className="h-3.5 w-3.5" aria-hidden /> মূল্য
              </dt>
              <dd className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                {formatTaka(gig.price)}
                {perSession > 0 ? (
                  <span className="ml-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    (প্রতি ক্লাসে প্রায় {formatTaka(perSession)})
                  </span>
                ) : null}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <Clock className="h-3.5 w-3.5" aria-hidden /> সময়কাল
              </dt>
              <dd className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                {gig.duration_weeks} সপ্তাহ
                <span className="ml-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                  (মোট {totalSessions} ক্লাস)
                </span>
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <Monitor className="h-3.5 w-3.5" aria-hidden /> পড়ানোর ধরন
              </dt>
              <dd className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                {modeLabel(gig.teaching_mode)}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <Sparkles className="h-3.5 w-3.5" aria-hidden /> সপ্তাহে ক্লাস
              </dt>
              <dd className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                {gig.sessions_per_week}টি
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            {gig.subjects.map((subject) => (
              <Badge key={subject} variant="default">
                {subject}
              </Badge>
            ))}
          </div>
          {gig.class_levels.length > 0 ? (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold">ক্লাস:</span> {gig.class_levels.join(", ")}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/40">
        <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200">যোগাযোগের আগে পড়ুন</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-7 text-amber-900/90 dark:text-amber-200/90">
          <li>দাম ও সময়সূচি শিক্ষকের নিজের দেওয়া — চূড়ান্ত শর্ত সরাসরি কথা বলে ঠিক করুন।</li>
          <li>PoraSathi পেমেন্ট নেয় না বা ধরে রাখে না; লেনদেনের ঝুঁকি আপনার।</li>
          <li>অগ্রিম টাকা দেওয়ার আগে{" "}
            <Link href="/safety" className="font-semibold underline">
              নিরাপত্তা নির্দেশিকা
            </Link>{" "}
            দেখে নিন।
          </li>
        </ul>
      </div>
    </div>
  );
}
