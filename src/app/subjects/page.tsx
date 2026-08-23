import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { TeacherDirectoryNav } from "@/components/seo/teacher-directory-nav";
import { SUBJECT_LANDINGS } from "@/config/seo";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Tutors by Subject in Bangladesh",
  description:
    "ইংরেজি, গণিত, পদার্থ, রসায়নসহ বাংলাদেশের প্রকাশিত বিষয়ভিত্তিক শিক্ষক খুঁজুন। PoraSathi-তে প্রতিটি মূল বিষয়ের আলাদা তালিকা আছে।",
  path: "/subjects",
});

const crumbs = [
  { name: "হোম", path: "/" },
  { name: "বিষয়" },
];

export default function SubjectsIndexPage() {
  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <Breadcrumbs items={crumbs} />
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        বিষয় অনুযায়ী শিক্ষক
      </h1>
      <p className="mt-4 max-w-2xl leading-8 text-slate-600 dark:text-slate-300">
        নিচের পাতাগুলো স্থিতিশীল বিষয় তালিকা। ফিল্টার মিলিয়ে তৈরি হওয়া অস্থায়ী খোঁজ সার্চ ইনডেক্সে রাখা হয় না।
      </p>
      <TeacherDirectoryNav current="subjects" />
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SUBJECT_LANDINGS.map((subject) => (
          <li key={subject.slug}>
            <Link
              href={subject.path}
              className="flex min-h-12 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-brand-700"
            >
              {subject.name} tutors
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
