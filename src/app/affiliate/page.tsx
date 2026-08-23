import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  Briefcase,
  GraduationCap,
  Home,
  Link2,
  MessageCircle,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { FaqList } from "@/components/seo/faq-list";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { affiliateConfig, AFFILIATE_TIERS } from "@/config/affiliate";
import { contactConfig, getWhatsAppUrl, siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "অ্যাফিলিয়েট প্রোগ্রাম",
  description:
    "PoraSathi অ্যাফিলিয়েট প্রোগ্রামে যোগ দিন — আপনার রেফারেল লিংক শেয়ার করে শিক্ষক ও অভিভাবকদের যুক্ত করুন এবং Premium দিন উপহার পান। শিক্ষার্থী, গৃহিণী বা চাকরিজীবী — সবাই অংশ নিতে পারেন।",
  path: "/affiliate",
});

const AUDIENCE = [
  { icon: GraduationCap, title: "শিক্ষার্থী", text: "ক্যাম্পাস ও ব্যাচের বন্ধুদের মধ্যে শেয়ার করুন।" },
  { icon: Home, title: "গৃহিণী", text: "এলাকার অভিভাবকদের ভালো শিক্ষক খুঁজে পেতে সাহায্য করুন।" },
  { icon: Briefcase, title: "চাকরিজীবী", text: "অবসর সময়ে পরিচিত মহলে PoraSathi পৌঁছে দিন।" },
  { icon: Users, title: "শিক্ষক", text: "সহকর্মী শিক্ষকদের আমন্ত্রণ জানিয়ে কমিউনিটি বড় করুন।" },
];

const STEPS = [
  {
    icon: UserPlus,
    title: "অ্যাকাউন্ট খুলুন",
    text: "ফ্রি রেজিস্ট্রেশন করলেই আপনার জন্য একটি ইউনিক রেফারেল কোড তৈরি হয়ে যাবে।",
  },
  {
    icon: Link2,
    title: "লিংক শেয়ার করুন",
    text: "ড্যাশবোর্ড থেকে কোড বা লিংক কপি করে WhatsApp, Facebook বা সরাসরি পাঠান।",
  },
  {
    icon: BadgeCheck,
    title: "পুরস্কার নিন",
    text: `আপনার লিংকে কেউ যুক্ত হয়ে ${affiliateConfig.qualifyingAction} সম্পন্ন করলে রেফারেলটি গণনা হবে।`,
  },
];

const FAQ = [
  {
    question: "অ্যাফিলিয়েট হতে কি টাকা লাগে?",
    answer:
      "না। যোগ দেওয়া সম্পূর্ণ ফ্রি এবং কোনো ফি বা জামানত নেই। শুধু একটি PoraSathi অ্যাকাউন্ট থাকলেই হবে।",
  },
  {
    question: "রেফারেল কীভাবে গণনা হয়?",
    answer:
      "আপনার রেফারেল লিংক দিয়ে কেউ নিবন্ধন করলে সেটি স্বয়ংক্রিয়ভাবে আপনার অ্যাকাউন্টে যুক্ত হয়। ড্যাশবোর্ডের রেফারেল পাতায় মোট সংখ্যা দেখতে পাবেন।",
  },
  {
    question: "পুরস্কার কি নগদ টাকায় দেওয়া হয়?",
    answer:
      `না। এই মুহূর্তে পুরস্কার দেওয়া হয় ${affiliateConfig.rewardUnit} হিসেবে — নগদ অর্থ বা ক্যাশ-আউট নয়। ভবিষ্যতে কাঠামো বদলালে এই পাতায় আগে জানানো হবে।`,
  },
  {
    question: "পুরস্কার পেতে কত সময় লাগে?",
    answer:
      `পুরস্কার এখনো ম্যানুয়ালি যাচাই করা হয়। শর্ত পূরণ হওয়ার পর সাধারণত ${affiliateConfig.reviewWindowBn}-এর মধ্যে আপনার অ্যাকাউন্টে যোগ হবে।`,
  },
  {
    question: "একই ব্যক্তি একাধিক অ্যাকাউন্ট খুলে রেফার করতে পারবেন?",
    answer:
      "না। ভুয়া বা ডুপ্লিকেট অ্যাকাউন্ট শনাক্ত হলে রেফারেল বাতিল হবে এবং প্রয়োজনে অ্যাকাউন্টে ব্যবস্থা নেওয়া হতে পারে। আসল ব্যবহারকারী যুক্ত করাই একমাত্র বৈধ উপায়।",
  },
];

export default function AffiliatePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { name: "হোম", path: "/" },
          { name: "অ্যাফিলিয়েট প্রোগ্রাম", path: "/affiliate" },
        ]}
      />

      <section className="relative mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-950 via-brand-800 to-brand-700 px-6 py-12 text-white shadow-xl sm:px-10">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-50">
          <Users className="h-4 w-4" aria-hidden />
          অ্যাফিলিয়েট প্রোগ্রাম
        </p>
        <h1 className="mt-4 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">
          পরিচিতদের যুক্ত করুন, {siteConfig.brandNameBangla} Premium উপহার পান
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-brand-50/90">
          আপনি শিক্ষার্থী, গৃহিণী বা চাকরিজীবী — যেই হোন না কেন, আপনার রেফারেল লিংক
          শেয়ার করে অভিভাবক ও শিক্ষকদের সঠিক সঙ্গী খুঁজে পেতে সাহায্য করতে পারেন।
          যোগ দিতে কোনো ফি লাগে না।
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/register"
            className={buttonStyles({
              size: "lg",
              className: "bg-white text-brand-900 hover:bg-brand-50 focus-visible:ring-white",
            })}
          >
            ফ্রি অ্যাকাউন্ট খুলুন
          </Link>
          <Link
            href="/dashboard/referrals"
            className={buttonStyles({
              variant: "outline",
              size: "lg",
              className: "border-white/40 bg-white/10 text-white hover:bg-white/20 dark:border-white/40 dark:bg-white/10 dark:text-white dark:hover:bg-white/20",
            })}
          >
            আমার রেফারেল কোড
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">কীভাবে কাজ করে</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <Card key={title}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-black text-brand-800 dark:bg-brand-900 dark:text-brand-200">
                    {index + 1}
                  </span>
                  <Icon className="h-6 w-6 text-brand-700 dark:text-brand-300" aria-hidden />
                </div>
                <h3 className="mt-3 font-bold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">কারা যোগ দিতে পারেন</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
          বয়স ১৮ বছরের বেশি হলে যে কেউ অংশ নিতে পারেন — আলাদা যোগ্যতা লাগে না।
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCE.map(({ icon: Icon, title, text }) => (
            <Card key={title}>
              <CardContent className="p-5">
                <Icon className="h-6 w-6 text-brand-700 dark:text-brand-300" aria-hidden />
                <h3 className="mt-3 font-bold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">পুরস্কার কাঠামো</h2>
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th scope="col" className="px-5 py-3 font-bold text-slate-900 dark:text-white">ধাপ</th>
                <th scope="col" className="px-5 py-3 font-bold text-slate-900 dark:text-white">সক্রিয় রেফারেল</th>
                <th scope="col" className="px-5 py-3 font-bold text-slate-900 dark:text-white">যা পাবেন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
              {AFFILIATE_TIERS.map((tier) => (
                <tr key={tier.name}>
                  <td className="px-5 py-4">
                    <Badge variant="brand">{tier.name}</Badge>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-100">{tier.range}</td>
                  <td className="px-5 py-4 leading-6 text-slate-600 dark:text-slate-300">{tier.reward}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Honesty guardrail: the payout is manual today, so we say so plainly
            instead of implying automatic cash earnings. */}
        <div className="mt-4 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0" aria-hidden />
          <p>
            <strong>স্বচ্ছতা:</strong> পুরস্কার দেওয়া হয় {affiliateConfig.rewardUnit} হিসেবে —{" "}
            <strong>নগদ টাকা নয়</strong>। রেফারেল গণনা স্বয়ংক্রিয় হলেও পুরস্কার Admin
            ম্যানুয়ালি যাচাই করে যোগ করেন ({affiliateConfig.reviewWindowBn})। কোনো নির্দিষ্ট
            আয়ের প্রতিশ্রুতি আমরা দিই না।
          </p>
        </div>
      </section>

      <FaqList title="সাধারণ জিজ্ঞাসা" items={FAQ} />

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">আরও জানতে চান?</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">
          পার্টনার শর্ত বা প্রোগ্রাম নিয়ে প্রশ্ন থাকলে সরাসরি যোগাযোগ করুন।
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a
            href={getWhatsAppUrl("আসসালামু আলাইকুম, আমি PoraSathi অ্যাফিলিয়েট প্রোগ্রাম সম্পর্কে জানতে চাই।")}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles({
              size: "lg",
              className: "bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-500",
            })}
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
            WhatsApp-এ যোগাযোগ
          </a>
          <Link href="/contact" className={buttonStyles({ variant: "outline", size: "lg" })}>
            যোগাযোগ পাতা
          </Link>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          হটলাইন: {contactConfig.hotlineDisplay} · {contactConfig.hoursBn}
        </p>
      </section>
    </div>
  );
}
