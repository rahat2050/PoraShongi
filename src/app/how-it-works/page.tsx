import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { FaqList } from "@/components/seo/faq-list";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "How PoraSathi Works",
  description:
    "PoraSathi-তে শিক্ষক খোঁজা, প্রোফাইল যাচাই, অনুরোধ পাঠানো এবং শিক্ষকদের টিউশন সুযোগ দেখার ধাপগুলো জানুন।",
  path: "/how-it-works",
});

const crumbs = [
  { name: "হোম", path: "/" },
  { name: "কীভাবে কাজ করে" },
];

const faqs = [
  {
    question: "লগইন ছাড়া কী করা যায়?",
    answer: "প্রকাশিত শিক্ষক তালিকা, শিক্ষক প্রোফাইল, লিডারবোর্ড, ব্লগ, কোচিং ও রিসোর্স দেখা যায়। অনুরোধ, মেসেজ, সেভ ও খোলা টিউশন তালিকার জন্য লগইন লাগে।",
  },
  {
    question: "শিক্ষক কীভাবে শিক্ষার্থী পান?",
    answer: "প্রোফাইল সম্পূর্ণ ও প্রকাশিত হলে শিক্ষার্থী/অভিভাবক খুঁজে পান। শিক্ষক লগইন করে প্রকাশিত টিউশন দেখতে ও সেভ করতে পারেন।",
  },
  {
    question: "যোগাযোগ কি সবার সামনে খোলা?",
    answer: "না। ফোন নম্বর ডিফল্টভাবে পাবলিক নয়। যোগাযোগের অনুরোধ গ্রহণ হলেই নম্বর দেখা যায়।",
  },
];

export default function HowItWorksPage() {
  return (
    <article className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <Breadcrumbs items={crumbs} />
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        PoraSathi কীভাবে কাজ করে
      </h1>
      <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
        খোঁজা থেকে সংযোগ — প্রতিটি ধাপ ইচ্ছাকৃতভাবে আলাদা রাখা হয়েছে, যাতে প্রথমে তথ্য দেখা যায় এবং পরে নিরাপদে যোগাযোগ হয়।
      </p>

      <section className="mt-10 space-y-3 leading-7 text-slate-700 dark:text-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">শিক্ষার্থী ও অভিভাবক</h2>
        <ol className="list-decimal space-y-2 pl-6">
          <li>
            <Link href="/teachers" className="font-medium text-brand-700 underline dark:text-brand-300">শিক্ষক খুঁজুন</Link>
            {" "}— ক্লাস, বিষয়, জেলা বা মাধ্যম বেছে প্রকাশিত প্রোফাইল দেখুন।
          </li>
          <li>যোগ্যতা, অভিজ্ঞতা, ফি, সময়, ভেরিফিকেশন ও রিভিউ যাচাই করুন।</li>
          <li>পছন্দ হলে লগইন করে অনুরোধ পাঠান, সেভ করুন বা মেসেজ করুন।</li>
          <li>অনুরোধ গ্রহণ হলে সময়সূচি ও ক্লাস একই অ্যাকাউন্ট থেকে চালান।</li>
        </ol>
      </section>

      <section className="mt-10 space-y-3 leading-7 text-slate-700 dark:text-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">শিক্ষক</h2>
        <ol className="list-decimal space-y-2 pl-6">
          <li>
            <Link href="/register" className="font-medium text-brand-700 underline dark:text-brand-300">অ্যাকাউন্ট খুলুন</Link>
            {" "}এবং শিক্ষক প্রোফাইল সম্পূর্ণ করুন।
          </li>
          <li>বিষয়, ক্লাস, এলাকা ও সময় স্পষ্ট রাখুন — এতে খোঁজায় প্রকাশিত হওয়া সহজ হয়।</li>
          <li>
            লগইন করে{" "}
            <Link href="/tuitions" className="font-medium text-brand-700 underline dark:text-brand-300">টিউশন সুযোগ</Link>
            {" "}দেখুন। এই তালিকা পাবলিক সার্চ ইনডেক্সে রাখা হয় না।
          </li>
          <li>অনুরোধ গ্রহণ, সময় ঠিক করা ও সম্পন্ন টিউশনের পর রিভিউ পেতে পারেন।</li>
        </ol>
      </section>

      <section className="mt-10 space-y-3 leading-7 text-slate-700 dark:text-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">এলাকা ও বিষয়</h2>
        <p>
          সুনামগঞ্জ ও সিলেটের জন্য আলাদা পাতা আছে, এবং প্রতিটি মূল বিষয়ের জন্য শিক্ষক তালিকা আছে। ফিল্টার মিলিয়ে তৈরি হওয়া হাজারো কম্বিনেশন ইনডেক্স করা হয় না — শুধু স্থিতিশীল, কাজে লাগে এমন পাতাগুলোই সার্চে থাকে।
        </p>
        <p>
          <Link href="/teachers/sunamganj" className="font-medium text-brand-700 underline dark:text-brand-300">সুনামগঞ্জের শিক্ষক</Link>
          {" · "}
          <Link href="/teachers/sylhet" className="font-medium text-brand-700 underline dark:text-brand-300">সিলেটের শিক্ষক</Link>
          {" · "}
          <Link href="/subjects" className="font-medium text-brand-700 underline dark:text-brand-300">বিষয় অনুযায়ী শিক্ষক</Link>
        </p>
      </section>

      <FaqList items={faqs} />
    </article>
  );
}
