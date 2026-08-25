import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { TeacherDirectoryNav } from "@/components/seo/teacher-directory-nav";
import { EXAM_LANDINGS } from "@/config/seo";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 600;

export const metadata: Metadata = buildPageMetadata({
  title: "Tutors by Exam & Class Level",
  description:
    "এসএসসি, এইচএসসি, ভর্তি ও বিশ্ববিদ্যালয় পর্যায়সহ শ্রেণি অনুযায়ী প্রকাশিত শিক্ষক খুঁজুন। PoraSathi-তে বিষয়, অভিজ্ঞতা ও মাধ্যম মিলিয়ে শিক্ষক বেছে নিন।",
  path: "/exams",
});

const crumbs = [
  { name: "হোম", path: "/" },
  { name: "পরীক্ষা ও শ্রেণি" },
];

export default function ExamsIndexPage() {
  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <Breadcrumbs items={crumbs} />
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        পরীক্ষা ও শ্রেণি অনুযায়ী শিক্ষক
      </h1>
      <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">
        কোন পরীক্ষা বা শ্রেণির জন্য শিক্ষক খুঁজছেন? নিচের তালিকা থেকে বেছে নিন। প্রতিটি পাতায় সেই
        স্তরে পড়ানো প্রকাশিত শিক্ষক প্রোফাইল দেখা যায়। খালি পাতা সার্চ ইঞ্জিনে ইনডেক্স করা হয় না।
      </p>
      <TeacherDirectoryNav current="exams" />

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {EXAM_LANDINGS.map((exam) => (
          <li key={exam.slug}>
            <Link
              href={exam.path}
              className="block h-full rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-brand-300 hover:bg-brand-50/60 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-700"
            >
              <span className="inline-flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                <GraduationCap className="h-5 w-5 text-brand-700 dark:text-brand-300" aria-hidden />
                {exam.nameBn} · {exam.name}
              </span>
              <span className="mt-2 block text-sm leading-7 text-slate-600 dark:text-slate-300">{exam.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
