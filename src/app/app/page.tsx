import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  MessageCircle,
  Moon,
  Search,
  Smartphone,
  WifiOff,
  Zap,
} from "lucide-react";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { FaqList } from "@/components/seo/faq-list";
import { Card, CardContent } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";
import { InstallButton } from "@/features/app/install-button";
import { siteConfig, getSiteUrl } from "@/config/site";
import { qrSvgPath } from "@/lib/qr";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "PoraSathi অ্যাপ ইনস্টল করুন",
  description:
    "PoraSathi কে মোবাইলের হোমস্ক্রিনে অ্যাপ হিসেবে যোগ করুন — কোনো Play Store ডাউনলোড লাগবে না, জায়গাও নেয় প্রায় কিছুই না। অফলাইন সাপোর্ট ও দ্রুত লোডিং সহ।",
  path: "/app",
});

/**
 * The QR points at this page rather than the homepage: someone scanning a
 * printed code lands on the install instructions, not a page they must then
 * navigate away from.
 */
const INSTALL_URL = `${getSiteUrl()}/app`;

const FEATURES = [
  {
    icon: Zap,
    title: "দ্রুত ও হালকা",
    text: "অ্যাপটি ১ MB-এরও কম জায়গা নেয়। পুরোনো ফোনেও স্বাচ্ছন্দ্যে চলে।",
  },
  {
    icon: WifiOff,
    title: "অফলাইনেও চলে",
    text: "ইন্টারনেট চলে গেলেও আগে দেখা পেজগুলো খুলবে, নেট ফিরলে নিজে থেকেই আপডেট হবে।",
  },
  {
    icon: Search,
    title: "কাছের শিক্ষক খুঁজুন",
    text: "GPS দিয়ে নির্দিষ্ট দূরত্বের মধ্যে শিক্ষক ও টিউশন খুঁজে নিন।",
  },
  {
    icon: MessageCircle,
    title: "রিয়েলটাইম চ্যাট",
    text: "শিক্ষক ও অভিভাবকের মধ্যে সরাসরি বার্তা — নিরাপত্তার জন্য ৪৮ ঘণ্টা পর মুছে যায়।",
  },
  {
    icon: Bell,
    title: "সবসময় হাতের নাগালে",
    text: "হোমস্ক্রিনের আইকনে এক চাপেই খুলবে, প্রতিবার ব্রাউজারে ঠিকানা লিখতে হবে না।",
  },
  {
    icon: Moon,
    title: "ডার্ক মোড",
    text: "রাতে চোখের আরামের জন্য পূর্ণ ডার্ক থিম সাপোর্ট।",
  },
];

const STEPS = [
  {
    platform: "Android — Chrome",
    items: [
      "উপরের “হোমস্ক্রিনে যোগ করুন” বাটনে চাপ দিন।",
      "বাটন না দেখলে ব্রাউজারের ⋮ মেনু খুলে “Install app” বা “Add to Home screen” বাছুন।",
      "নিশ্চিত করুন — আইকনটি হোমস্ক্রিনে চলে আসবে।",
    ],
  },
  {
    platform: "iPhone / iPad — Safari",
    items: [
      "Safari-তে এই পেজটি খুলুন (Chrome-এ এই সুবিধা নেই)।",
      "নিচের Share (⬆️) বাটনে চাপ দিন।",
      "তালিকা থেকে “Add to Home Screen” বাছুন, তারপর Add চাপুন।",
    ],
  },
  {
    platform: "কম্পিউটার — Chrome / Edge",
    items: [
      "অ্যাড্রেস বারের ডান পাশে ইনস্টল (⊕) আইকনে ক্লিক করুন।",
      "অথবা মেনু থেকে “Install PoraSathi” বাছুন।",
      "আলাদা উইন্ডোতে অ্যাপের মতো ব্যবহার করুন।",
    ],
  },
];

const FAQ = [
  {
    question: "PoraSathi কি Google Play Store-এ আছে?",
    answer:
      "না। PoraSathi একটি Progressive Web App (PWA) — সরাসরি ব্রাউজার থেকেই হোমস্ক্রিনে যোগ করা যায়। Play Store থেকে ডাউনলোডের ঝামেলা নেই, আর আপডেটও স্বয়ংক্রিয়ভাবে হয়ে যায়।",
  },
  {
    question: "ইনস্টল করতে কত জায়গা লাগবে?",
    answer:
      "সাধারণত ১ MB-এরও কম। সাধারণ অ্যাপের তুলনায় এটি অনেক হালকা, তাই কম স্টোরেজের ফোনেও সমস্যা হয় না।",
  },
  {
    question: "ইনস্টল করার পর কি আলাদা করে লগইন করতে হবে?",
    answer:
      "না। ব্রাউজারে আগে থেকে লগইন করা থাকলে অ্যাপেও সেই সেশন চালু থাকবে।",
  },
  {
    question: "ইন্টারনেট ছাড়া কি অ্যাপ কাজ করবে?",
    answer:
      "আগে দেখা পেজগুলো অফলাইনে খুলবে। তবে নতুন শিক্ষক খোঁজা, বার্তা পাঠানো বা টিউশন পোস্ট করার জন্য ইন্টারনেট সংযোগ প্রয়োজন।",
  },
  {
    question: "অ্যাপটি কি সরানো যাবে?",
    answer:
      "হ্যাঁ। সাধারণ অ্যাপের মতোই আইকন চেপে ধরে Uninstall বা Remove করা যাবে। এতে আপনার অ্যাকাউন্ট মুছে যাবে না।",
  },
];

export default function AppPage() {
  const qr = qrSvgPath(INSTALL_URL);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { name: "হোম", path: "/" },
          { name: "অ্যাপ", path: "/app" },
        ]}
      />

      <section className="relative mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-950 via-brand-800 to-brand-700 px-6 py-12 text-white shadow-xl sm:px-10">
        <div className="grid items-center gap-10 md:grid-cols-[1.3fr_auto]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-50">
              <Smartphone className="h-4 w-4" aria-hidden />
              ফ্রি অ্যাপ
            </p>
            <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
              {siteConfig.brandNameBangla} এখন আপনার হোমস্ক্রিনে
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-brand-50/90">
              Play Store-এ যাওয়ার দরকার নেই। এক চাপেই {siteConfig.brandName} আপনার ফোনে
              অ্যাপ হিসেবে যোগ হবে — দ্রুত খুলবে, অফলাইনেও চলবে, আর জায়গা নেবে
              প্রায় কিছুই না।
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <InstallButton />
            </div>

            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-brand-100">
              {["সম্পূর্ণ ফ্রি", "কোনো বিজ্ঞাপন নেই", "১ MB-এর কম", "স্বয়ংক্রিয় আপডেট"].map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* QR is generated at build time from our own encoder — no third-party
              image API, so nothing leaks to an external origin. */}
          <figure className="mx-auto hidden w-fit rounded-2xl bg-white p-4 text-center shadow-lg md:block">
            <svg
              viewBox={`0 0 ${qr.size} ${qr.size}`}
              width={168}
              height={168}
              role="img"
              aria-label={`QR কোড — ${INSTALL_URL}`}
              shapeRendering="crispEdges"
            >
              <path d={qr.d} fill="#0f172a" />
            </svg>
            <figcaption className="mt-2 max-w-[168px] text-xs font-semibold leading-5 text-slate-600">
              ফোনের ক্যামেরা দিয়ে স্ক্যান করুন
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">অ্যাপে যা যা পাবেন</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
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
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">কীভাবে ইনস্টল করবেন</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {STEPS.map((step) => (
            <Card key={step.platform}>
              <CardContent className="p-5">
                <h3 className="font-bold text-slate-900 dark:text-white">{step.platform}</h3>
                <ol className="mt-3 space-y-2.5">
                  {step.items.map((item, index) => (
                    <li key={item} className="flex gap-2.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800 dark:bg-brand-900 dark:text-brand-200">
                        {index + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <FaqList title="সাধারণ জিজ্ঞাসা" items={FAQ} />

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">ইনস্টল না করেও শুরু করতে পারেন</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">
          অ্যাপ ইনস্টল করা বাধ্যতামূলক নয় — ব্রাউজার থেকেই সব সুবিধা পাবেন।
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/teachers" className={buttonStyles({ size: "lg" })}>
            শিক্ষক খুঁজুন
          </Link>
          <Link href="/hire-tutor" className={buttonStyles({ variant: "outline", size: "lg" })}>
            টিউটর চেয়ে আবেদন করুন
          </Link>
        </div>
      </section>
    </div>
  );
}
