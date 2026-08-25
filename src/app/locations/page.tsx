import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { TeacherDirectoryNav } from "@/components/seo/teacher-directory-nav";
import { DISTRICT_INFO, DIVISION_NAMES_BN } from "@/config/districts";
import { DIVISIONS } from "@/config/options";
import { DISTRICT_LANDINGS, FEATURED_LOCATIONS, toSeoSlug } from "@/config/seo";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 600;

export const metadata: Metadata = buildPageMetadata({
  title: "Tutors by District in Bangladesh — 64 Districts",
  description:
    "বাংলাদেশের ৬৪ জেলায় প্রাইভেট শিক্ষক ও হোম টিউশন খুঁজুন। PoraSathi প্রকাশিত শিক্ষক প্রোফাইল বিভাগ ও জেলা অনুযায়ী সাজায়।",
  path: "/locations",
});

const crumbs = [
  { name: "হোম", path: "/" },
  { name: "এলাকা" },
];

const pathByDistrict = new Map(DISTRICT_LANDINGS.map((item) => [item.name, item.path]));
const featuredSlugs = new Set<string>(FEATURED_LOCATIONS.map((item) => item.slug));

const districtsByDivision = DIVISIONS.map((division) => ({
  division,
  title: DIVISION_NAMES_BN[division],
  items: DISTRICT_INFO.filter((district) => district.division === division),
}));

export default function LocationsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <Breadcrumbs items={crumbs} />
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        জেলা অনুযায়ী শিক্ষক
      </h1>
      <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">
        বাংলাদেশের ৬৪ জেলার প্রতিটির জন্য আলাদা তালিকা আছে। PoraSathi প্রথমে{" "}
        <Link href="/teachers/sunamganj" className="font-medium text-brand-700 underline dark:text-brand-300">সুনামগঞ্জ</Link> ও{" "}
        <Link href="/teachers/sylhet" className="font-medium text-brand-700 underline dark:text-brand-300">সিলেটে</Link>{" "}
        জোর দিচ্ছে, তবে যেখানেই প্রকাশিত শিক্ষক প্রোফাইল থাকে সেটাই এখানে দেখা যায়। খালি জেলার পাতা
        সার্চ ইঞ্জিনে ইনডেক্স করা হয় না। এলাকার বাইরে পড়াতে{" "}
        <Link href="/teachers/online" className="font-medium text-brand-700 underline dark:text-brand-300">অনলাইন শিক্ষক</Link>{" "}
        দেখুন।
      </p>
      <TeacherDirectoryNav current="locations" />

      {districtsByDivision.map((group) => (
        <section key={group.division} className="mt-10" aria-labelledby={`division-${group.division}`}>
          <h2
            id={`division-${group.division}`}
            className="text-lg font-semibold text-slate-900 dark:text-slate-100"
          >
            {group.title}
            <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
              ({group.items.length} জেলা)
            </span>
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {group.items.map((district) => {
              const path = pathByDistrict.get(district.name);
              const featured = featuredSlugs.has(toSeoSlug(district.name));
              if (!path) return null;
              return (
                <li key={district.name}>
                  <Link
                    href={path}
                    className={
                      featured
                        ? "inline-flex min-h-10 items-center gap-1.5 rounded-full border border-brand-700 bg-brand-50 px-3 text-sm font-semibold text-brand-800 dark:bg-brand-950/40 dark:text-brand-200"
                        : "inline-flex min-h-10 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:border-brand-300 hover:text-brand-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    }
                  >
                    <MapPin className="h-3.5 w-3.5 text-brand-600 dark:text-brand-300" aria-hidden />
                    {district.nameBn}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <p className="mt-10 text-sm leading-7 text-slate-600 dark:text-slate-300">
        আপনার জেলায় শিক্ষক না পেলে{" "}
        <Link href="/hire-tutor" className="font-medium text-brand-700 underline dark:text-brand-300">
          শিক্ষক চাই-এর ফর্ম
        </Link>{" "}
        পূরণ করুন — লগইন ছাড়াই পাঠানো যায়।
      </p>
    </div>
  );
}
