import type { Metadata } from "next";
import Link from "next/link";
import { Landmark } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { TeacherDirectoryNav } from "@/components/seo/teacher-directory-nav";
import { MEDIUM_LANDINGS } from "@/config/seo";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 600;

export const metadata: Metadata = buildPageMetadata({
  title: "Tutors by Medium — Bangla, English Medium, O & A Level",
  description:
    "বাংলা মাধ্যম, ইংলিশ মিডিয়াম, ইংলিশ ভার্সন, ও/এ লেভেল ও মাদ্রাসা — মাধ্যম অনুযায়ী প্রকাশিত শিক্ষক খুঁজুন। PoraSathi-তে যোগ্যতা ও অভিজ্ঞতা মিলিয়ে বেছে নিন।",
  path: "/medium",
});

const crumbs = [
  { name: "হোম", path: "/" },
  { name: "মাধ্যম" },
];

export default function MediumIndexPage() {
  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <Breadcrumbs items={crumbs} />
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        মাধ্যম অনুযায়ী শিক্ষক
      </h1>
      <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">
        আপনার সন্তান কোন কারিকুলামে পড়ে? নিচের তালিকা থেকে বেছে নিন — প্রতিটি পাতায় সেই
        মাধ্যমে পড়ানো প্রকাশিত শিক্ষক প্রোফাইল দেখা যায়। খালি পাতা সার্চ ইঞ্জিনে ইনডেক্স করা হয় না।
      </p>
      <TeacherDirectoryNav current="medium" />

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {MEDIUM_LANDINGS.map((medium) => (
          <li key={medium.slug}>
            <Link
              href={medium.path}
              className="block h-full rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-brand-300 hover:bg-brand-50/60 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-700"
            >
              <span className="inline-flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                <Landmark className="h-5 w-5 text-brand-700 dark:text-brand-300" aria-hidden />
                {medium.nameBn} · {medium.name}
              </span>
              <span className="mt-2 block text-sm leading-7 text-slate-600 dark:text-slate-300">{medium.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
