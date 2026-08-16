import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "যোগাযোগ ও সহায়তা",
  description: "PoraSathi সহায়তা, গোপনীয়তা ও নিরাপত্তা যোগাযোগের তথ্য।",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">যোগাযোগ ও সহায়তা</h1>
      <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">অ্যাকাউন্ট, গোপনীয়তা, নিরাপত্তা, ভেরিফিকেশন বা রিপোর্ট সম্পর্কে আমাদের লিখুন।</p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">ইমেইল</h2>
        <a href="mailto:hello@porasathi.com" className="mt-2 inline-block font-medium text-brand-700 underline dark:text-brand-300">hello@porasathi.com</a>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">অ্যাকাউন্টের ইমেইল, সমস্যার সংক্ষিপ্ত বিবরণ, সংশ্লিষ্ট প্রোফাইল/টিউশন লিংক এবং প্রয়োজনীয় স্ক্রিনশট দিন। পাসওয়ার্ড, OTP বা সম্পূর্ণ পরিচয়পত্র ইমেইলে পাঠাবেন না।</p>
      </div>

      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
        <h2 className="font-semibold">জরুরি পরিস্থিতি</h2>
        <p className="mt-2 text-sm leading-6">PoraSathi জরুরি সেবা নয়। তাৎক্ষণিক বিপদে বাংলাদেশের জাতীয় জরুরি সেবা <strong>৯৯৯</strong>-এ যোগাযোগ করুন। আরও নির্দেশনার জন্য <Link href="/safety" className="font-medium underline">নিরাপত্তা পেজ</Link> দেখুন।</p>
      </div>
    </div>
  );
}
