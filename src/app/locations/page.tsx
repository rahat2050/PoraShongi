import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { TeacherDirectoryNav } from "@/components/seo/teacher-directory-nav";
import { FEATURED_LOCATIONS } from "@/config/seo";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Tutors by Location in Bangladesh",
  description:
    "সুনামগঞ্জ ও সিলেটে প্রাইভেট শিক্ষক এবং হোম টিউশন খুঁজুন। PoraSathi প্রকাশিত শিক্ষক প্রোফাইল এলাকা অনুযায়ী সাজায়।",
  path: "/locations",
});

const crumbs = [
  { name: "হোম", path: "/" },
  { name: "এলাকা" },
];

export default function LocationsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <Breadcrumbs items={crumbs} />
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        এলাকা অনুযায়ী শিক্ষক
      </h1>
      <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">
        PoraSathi প্রথমে সুনামগঞ্জ ও সিলেটে শিক্ষক–শিক্ষার্থী মেলানোর উপর জোর দিচ্ছে। অন্য জেলায় প্রকাশিত শিক্ষক থাকলে{" "}
        <Link href="/teachers" className="font-medium text-brand-700 underline dark:text-brand-300">শিক্ষক খোঁজার পাতা</Link>
        {" "}থেকে জেলা বেছে দেখা যাবে। খালি এলাকার জন্য আলাদা পাতা তৈরি করা হয়নি। এলাকার বাইরে পড়াতে{" "}
        <Link href="/teachers/online" className="font-medium text-brand-700 underline dark:text-brand-300">অনলাইন শিক্ষক</Link> দেখুন।
      </p>
      <TeacherDirectoryNav />

      <ul className="mt-8 space-y-4">
        {FEATURED_LOCATIONS.map((location) => (
          <li key={location.slug}>
            <Link
              href={location.path}
              className="block rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-brand-300 hover:bg-brand-50/60 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-700"
            >
              <span className="inline-flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                <MapPin className="h-5 w-5 text-brand-700 dark:text-brand-300" aria-hidden />
                {location.nameBn} · {location.name}
              </span>
              <span className="mt-2 block text-sm leading-7 text-slate-600 dark:text-slate-300">{location.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
