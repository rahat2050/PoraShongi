import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { TeacherDirectoryNav } from "@/components/seo/teacher-directory-nav";
import { INSTITUTION_LANDINGS } from "@/config/seo";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 600;

export const metadata: Metadata = buildPageMetadata({
  title: "Tutors by University & Institution — DU, BUET, Medical",
  description:
    "ঢাকা বিশ্ববিদ্যালয়, বুয়েট, ঢাকা মেডিকেলসহ বিভিন্ন প্রতিষ্ঠানের শিক্ষার্থী ও প্রাক্তন শিক্ষার্থী যারা প্রাইভেট পড়ান — সেই প্রকাশিত শিক্ষক প্রোফাইল দেখুন।",
  path: "/institutions",
});

const crumbs = [
  { name: "হোম", path: "/" },
  { name: "প্রতিষ্ঠান" },
];

export default function InstitutionsIndexPage() {
  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <Breadcrumbs items={crumbs} />
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        প্রতিষ্ঠান অনুযায়ী শিক্ষক
      </h1>
      <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">
        অনেক অভিভাবক নির্দিষ্ট প্রতিষ্ঠানের শিক্ষার্থী বা প্রাক্তন শিক্ষার্থী খোঁজেন। শিক্ষকরা
        প্রোফাইলে নিজের শিক্ষাগত প্রতিষ্ঠানের নাম লেখেন — নিচের পাতাগুলো সেই নাম মিলিয়ে তৈরি।
      </p>
      <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
        যাচাই: PoraSathi শিক্ষাগত সনদ যাচাই করে। প্রোফাইলের ভেরিফিকেশন টিয়ার দেখে নিন কোন স্তরের
        যাচাই সম্পন্ন হয়েছে।
      </p>
      <TeacherDirectoryNav current="institutions" />

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {INSTITUTION_LANDINGS.map((institution) => (
          <li key={institution.slug}>
            <Link
              href={institution.path}
              className="block h-full rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-brand-300 hover:bg-brand-50/60 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-700"
            >
              <span className="inline-flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                <GraduationCap className="h-5 w-5 text-brand-700 dark:text-brand-300" aria-hidden />
                {institution.nameBn}
              </span>
              <span className="mt-0.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {institution.name}
              </span>
              <span className="mt-2 block text-sm leading-7 text-slate-600 dark:text-slate-300">{institution.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
