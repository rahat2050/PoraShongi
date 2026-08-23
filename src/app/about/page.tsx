import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { FEATURED_LOCATIONS } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "About PoraSathi",
  description:
    "PoraSathi (পড়াসাথী) বাংলাদেশের শিক্ষার্থী, অভিভাবক ও শিক্ষককে যুক্ত করার টিউশন প্ল্যাটফর্ম। সুনামগঞ্জ ও সিলেট থেকে শুরু।",
  path: "/about",
});

const crumbs = [
  { name: "হোম", path: "/" },
  { name: "আমাদের সম্পর্কে" },
];

export default function AboutPage() {
  return (
    <article className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <Breadcrumbs items={crumbs} />
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        PoraSathi কী?
      </h1>
      <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
        {siteConfig.brandName} ({siteConfig.brandNameBangla}) বাংলাদেশে প্রাইভেট শিক্ষক ও টিউশন মিলিয়ে দেওয়ার একটি ডিজিটাল প্ল্যাটফর্ম। {siteConfig.tagline} — {siteConfig.branding}।
      </p>

      <section className="mt-10 space-y-3 leading-7 text-slate-700 dark:text-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">কে ব্যবহার করে</h2>
        <p>শিক্ষার্থী ও অভিভাবক ক্লাস, বিষয়, এলাকা ও মাধ্যম অনুযায়ী প্রকাশিত শিক্ষক প্রোফাইল দেখতে পারেন — এজন্য অ্যাকাউন্ট লাগে না। পছন্দের শিক্ষককে অনুরোধ, মেসেজ বা সেভ করতে লগইন করতে হয়।</p>
        <p>শিক্ষক নিজের প্রোফাইল প্রকাশ করেন, টিউশন সুযোগ দেখেন এবং সময়সূচি পরিচালনা করেন। খোলা টিউশন তালিকা লগইন করা সদস্যদের জন্য রাখা হয়েছে, যাতে ব্যক্তিগত চাহিদা নিয়ন্ত্রিত থাকে।</p>
      </section>

      <section className="mt-10 space-y-3 leading-7 text-slate-700 dark:text-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">কোথায় শুরু</h2>
        <p>প্রথম লক্ষ্য বাজার সুনামগঞ্জ ও সিলেট। প্ল্যাটফর্মটি পুরো বাংলাদেশের জন্য তৈরি; নতুন এলাকায় শিক্ষক যুক্ত হলে সেই তালিকাও খোঁজা যাবে।</p>
        <ul className="list-disc space-y-2 pl-6">
          {FEATURED_LOCATIONS.map((location) => (
            <li key={location.slug}>
              <Link href={location.path} className="font-medium text-brand-700 underline dark:text-brand-300">
                {location.possessiveBn} শিক্ষক
              </Link>
              {" — "}
              {location.blurb}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 space-y-3 leading-7 text-slate-700 dark:text-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">মিল ও বিশ্বাস</h2>
        <p>খোঁজার ফলাফল নিয়মভিত্তিক ফিল্টার ও প্রাসঙ্গিকতা দিয়ে সাজানো হয়। এটি কোনো গ্যারান্টি নয়। ভেরিফিকেশন ব্যাজ নির্দিষ্ট তথ্য যাচাইয়ের স্তর বোঝায়। প্রথম সাক্ষাৎ, ফি ও নিরাপত্তা যাচাই ব্যবহারকারীর দায়িত্ব — বিস্তারিত <Link href="/safety" className="font-medium text-brand-700 underline dark:text-brand-300">নিরাপত্তা নির্দেশিকায়</Link> আছে।</p>
      </section>

      <p className="mt-10 text-sm text-slate-600 dark:text-slate-300">
        প্রশ্ন থাকলে <Link href="/contact" className="font-medium text-brand-700 underline dark:text-brand-300">যোগাযোগ করুন</Link> অথবা{" "}
        <Link href="/how-it-works" className="font-medium text-brand-700 underline dark:text-brand-300">কীভাবে কাজ করে</Link> পড়ুন।
      </p>
    </article>
  );
}
