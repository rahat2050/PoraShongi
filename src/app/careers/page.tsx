import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Clock, Mail, MapPin, MessageCircle, Sparkles } from "lucide-react";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { CAREER_ROLES, CAREER_VALUES } from "@/config/careers";
import { contactConfig, getWhatsAppUrl, siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "ক্যারিয়ার",
  description:
    "PoraSathi টিমে যোগ দিন — ক্যাম্পাস অ্যাম্বাসেডর, কনটেন্ট রাইটার, কমিউনিটি মডারেটর ও ডেভেলপার ইন্টার্নশিপের সুযোগ। বাংলাদেশের যেকোনো জেলা থেকে রিমোট কাজের সুযোগ।",
  path: "/careers",
});

const APPLY_SUBJECT = "PoraSathi Careers — আবেদন";

export default function CareersPage() {
  const openRoles = CAREER_ROLES.filter((role) => role.open);
  const upcomingRoles = CAREER_ROLES.filter((role) => !role.open);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { name: "হোম", path: "/" },
          { name: "ক্যারিয়ার", path: "/careers" },
        ]}
      />

      <section className="relative mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-950 via-brand-800 to-brand-700 px-6 py-12 text-white shadow-xl sm:px-10">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-50">
          <Briefcase className="h-4 w-4" aria-hidden />
          ক্যারিয়ার
        </p>
        <h1 className="mt-4 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">
          {siteConfig.brandNameBangla}-এর সঙ্গে কাজ করুন
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-brand-50/90">
          আমরা বাংলাদেশের শিক্ষার্থী ও অভিভাবকদের জন্য সঠিক শিক্ষক খুঁজে পাওয়া সহজ
          করছি। দল ছোট, কিন্তু দায়িত্ব আসল — আপনার কাজ সরাসরি হাজারো পরিবারে
          পৌঁছাবে।
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href={`mailto:${contactConfig.email}?subject=${encodeURIComponent(APPLY_SUBJECT)}`}
            className={buttonStyles({
              size: "lg",
              className: "bg-white text-brand-900 hover:bg-brand-50 focus-visible:ring-white",
            })}
          >
            <Mail className="h-5 w-5" aria-hidden />
            আবেদন পাঠান
          </a>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">আমরা যা বিশ্বাস করি</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CAREER_VALUES.map((value) => (
            <Card key={value.title}>
              <CardContent className="p-5">
                <Sparkles className="h-6 w-6 text-brand-700 dark:text-brand-300" aria-hidden />
                <h3 className="mt-3 font-bold text-slate-900 dark:text-white">{value.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{value.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">খোলা পদ</h2>
        <div className="mt-5 space-y-4">
          {openRoles.map((role) => (
            <Card key={role.title}>
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{role.title}</h3>
                    <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-4 w-4" aria-hidden />
                        {role.type}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" aria-hidden />
                        {role.location}
                      </span>
                    </p>
                  </div>
                  <Badge variant="success">{role.commitment}</Badge>
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{role.summary}</p>

                <h4 className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  দায়িত্ব
                </h4>
                <ul className="mt-2 space-y-1.5">
                  {role.responsibilities.map((item) => (
                    <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>

                <a
                  href={`mailto:${contactConfig.email}?subject=${encodeURIComponent(`${APPLY_SUBJECT} — ${role.title}`)}`}
                  className={buttonStyles({ className: "mt-5" })}
                >
                  এই পদে আবেদন করুন
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {upcomingRoles.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">শীঘ্রই আসছে</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {upcomingRoles.map((role) => (
              <Card key={role.title}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white">{role.title}</h3>
                    <Badge variant="outline">{role.type}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{role.summary}</p>
                  <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {role.commitment}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">কীভাবে আবেদন করবেন</h2>
        <ol className="mt-4 space-y-2.5">
          {[
            `${contactConfig.email} ঠিকানায় ইমেইল করুন, বিষয়ে পদের নাম লিখুন।`,
            "সংক্ষিপ্ত পরিচয়, আপনি কেন উপযুক্ত এবং (থাকলে) কাজের নমুনা বা CV যুক্ত করুন।",
            "আপনার জেলা ও সপ্তাহে কত সময় দিতে পারবেন তা উল্লেখ করুন।",
          ].map((item, index) => (
            <li key={item} className="flex gap-2.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800 dark:bg-brand-900 dark:text-brand-200">
                {index + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>

        <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
          উপযুক্ত মনে হলে আমরা {contactConfig.hoursBn} সময়ের মধ্যে যোগাযোগ করব। কোনো
          পদের জন্যই আবেদন ফি নেওয়া হয় না — কেউ টাকা চাইলে সেটি প্রতারণা।
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={getWhatsAppUrl("আসসালামু আলাইকুম, আমি PoraSathi-তে কাজের সুযোগ সম্পর্কে জানতে চাই।")}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles({
              className: "bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-500",
            })}
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
            WhatsApp-এ প্রশ্ন করুন
          </a>
          <Link href="/about" className={buttonStyles({ variant: "outline" })}>
            আমাদের সম্পর্কে
          </Link>
        </div>
      </section>
    </div>
  );
}
