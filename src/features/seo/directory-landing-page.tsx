import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { FaqList } from "@/components/seo/faq-list";
import { JsonLd } from "@/components/seo/json-ld";
import { PublicTeacherResults } from "@/components/seo/public-teacher-results";
import { TeacherDirectoryNav } from "@/components/seo/teacher-directory-nav";
import {
  DISTRICT_LANDINGS,
  EXAM_LANDINGS,
  INSTITUTION_LANDINGS,
  MEDIUM_LANDINGS,
  SUBJECT_LANDINGS,
  type DirectoryLanding,
} from "@/config/seo";
import { DIVISION_NAMES_BN } from "@/config/districts";
import { searchTeachers } from "@/lib/data/teachers";
import { isSupabaseConfigured } from "@/lib/env";
import { localTutorCollectionJsonLd } from "@/lib/seo/jsonld";
import { noIndexMetadata, paginatedDirectoryMetadata } from "@/lib/seo/metadata";
import { firstParam } from "@/lib/utils";

export const DIRECTORY_PAGE_SIZE = 12;

/**
 * ল্যান্ডিং-ভিত্তিক শিক্ষক সার্চ। `cache()` দেওয়া আছে বলে একই রিকোয়েস্টে
 * `generateMetadata` ও পেজ দুটোই ডাকলেও ডেটাবেসে একবারই যায়।
 */
export const fetchDirectoryTeachers = cache(
  async (landing: DirectoryLanding, page: number) =>
    isSupabaseConfigured()
      ? searchTeachers({
          ...(landing.kind === "district" ? { district: landing.landing.name } : {}),
          ...(landing.kind === "exam" ? { classLevel: landing.landing.classLevel } : {}),
          ...(landing.kind === "medium" ? { medium: landing.landing.medium } : {}),
          ...(landing.kind === "institution" ? { institution: landing.landing.keyword } : {}),
          page,
          pageSize: DIRECTORY_PAGE_SIZE,
          sort: "relevance",
        })
      : { data: { total: 0, results: [] }, error: null },
);

export function directoryPageNumber(searchParams: Record<string, string | string[] | undefined>): number {
  return Math.max(1, Number(firstParam(searchParams.page) ?? "1") || 1);
}

function landingTitle(landing: DirectoryLanding): string {
  if (landing.kind === "district") {
    return `Private Tutors & Home Tuition in ${landing.landing.name}`;
  }
  if (landing.kind === "medium") {
    return `${landing.landing.name} Tutors in Bangladesh`;
  }
  if (landing.kind === "institution") {
    return `${landing.landing.name} Tutors & Home Teachers in Bangladesh`;
  }
  return `${landing.landing.name} Tutors & Coaching in Bangladesh`;
}

function landingDescription(landing: DirectoryLanding): string {
  if (landing.kind === "district") {
    return `${landing.landing.nameBn} (${landing.landing.name}) জেলায় প্রাইভেট শিক্ষক, হোম টিউটর ও অনলাইন শিক্ষক খুঁজুন। PoraSathi-তে প্রকাশিত প্রোফাইল দেখে নিরাপদে সংযোগ করুন।`;
  }
  if (landing.kind === "medium") {
    return `${landing.landing.nameBn} (${landing.landing.name}) শিক্ষক খুঁজুন। PoraSathi-তে প্রকাশিত প্রোফাইলে যোগ্যতা, অভিজ্ঞতা, এলাকা ও পড়ানোর ধরন দেখে নিরাপদে সংযোগ করুন।`;
  }
  if (landing.kind === "institution") {
    return `${landing.landing.nameBn} (${landing.landing.name})-এর শিক্ষার্থী বা প্রাক্তন শিক্ষার্থী যারা প্রাইভেট পড়ান — সেই প্রকাশিত শিক্ষক প্রোফাইল PoraSathi-তে দেখুন।`;
  }
  return `${landing.landing.nameBn} (${landing.landing.name}) প্রস্তুতির জন্য প্রকাশিত শিক্ষক প্রোফাইল দেখুন। বিষয়, অভিজ্ঞতা, মাধ্যম ও এলাকা মিলিয়ে PoraSathi-তে শিক্ষক বেছে নিন।`;
}

/**
 * খালি ল্যান্ডিং পেজ সার্চে তুলব না — ৬৪ জেলার জন্য thin-content জাল তৈরি হবে।
 * যেখানে অন্তত একজন প্রকাশিত শিক্ষক আছে, শুধু সেটাই index হবে।
 */
export async function directoryLandingMetadata(
  landing: DirectoryLanding,
  searchParams: Record<string, string | string[] | undefined>,
): Promise<Metadata> {
  const page = directoryPageNumber(searchParams);
  const result = await fetchDirectoryTeachers(landing, page);
  const total = result.data?.total ?? 0;

  if (result.error || total === 0) {
    return noIndexMetadata(landingTitle(landing), landingDescription(landing));
  }

  return paginatedDirectoryMetadata({
    title: landingTitle(landing),
    description: landingDescription(landing),
    path: landing.landing.path,
    page,
  });
}

export async function DirectoryLandingPage({
  landing,
  searchParams,
}: {
  landing: DirectoryLanding;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const page = directoryPageNumber(searchParams);
  const result = await fetchDirectoryTeachers(landing, page);
  const total = result.data?.total ?? 0;
  const teachers = result.data?.results ?? [];
  const totalPages = Math.max(1, Math.ceil(total / DIRECTORY_PAGE_SIZE));

  const heading =
    landing.kind === "district"
      ? `${landing.landing.possessiveBn} প্রাইভেট শিক্ষক ও টিউশন`
      : landing.kind === "medium"
        ? `${landing.landing.nameBn} শিক্ষক`
        : landing.kind === "institution"
          ? `${landing.landing.nameBn}-এর শিক্ষক`
          : `${landing.landing.nameBn} প্রস্তুতির শিক্ষক`;

  const intro =
    landing.kind === "district"
      ? `${landing.landing.nameBn} জেলার প্রকাশিত শিক্ষক প্রোফাইল এখানে। প্রতিটি প্রোফাইলে যোগ্যতা, অভিজ্ঞতা, পড়ানোর মাধ্যম ও এলাকা থাকে।`
      : landing.landing.blurb;

  const crumbs =
    landing.kind === "district"
      ? [
          { name: "হোম", path: "/" },
          { name: "শিক্ষক", path: "/teachers" },
          { name: landing.landing.nameBn },
        ]
      : landing.kind === "medium"
        ? [
            { name: "হোম", path: "/" },
            { name: "মাধ্যম", path: "/medium" },
            { name: landing.landing.nameBn },
          ]
        : landing.kind === "institution"
          ? [
              { name: "হোম", path: "/" },
              { name: "প্রতিষ্ঠান", path: "/institutions" },
              { name: landing.landing.nameBn },
            ]
          : [
              { name: "হোম", path: "/" },
              { name: "পরীক্ষা", path: "/exams" },
              { name: landing.landing.nameBn },
            ];

  // একই বিভাগের পার্শ্ববর্তী জেলা — আন্তঃসংযোগ বাড়াতে (Eudika-র প্রধান কৌশল)।
  const siblingDistricts =
    landing.kind === "district"
      ? DISTRICT_LANDINGS.filter(
          (item) => item.division === landing.landing.division && item.slug !== landing.landing.slug,
        )
      : DISTRICT_LANDINGS.slice(0, 12);

  const otherExams = EXAM_LANDINGS.filter((item) => item.slug !== (landing.kind === "exam" ? landing.landing.slug : null));
  const otherMediums = MEDIUM_LANDINGS.filter(
    (item) => item.slug !== (landing.kind === "medium" ? landing.landing.slug : null),
  );
  const otherInstitutions = INSTITUTION_LANDINGS.filter(
    (item) => item.slug !== (landing.kind === "institution" ? landing.landing.slug : null),
  );

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <JsonLd
        data={localTutorCollectionJsonLd({
          name: landingTitle(landing),
          path: landing.landing.path,
          description: landingDescription(landing),
        })}
      />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{heading}</h1>
      <p className="mt-3 max-w-3xl leading-8 text-slate-600 dark:text-slate-300">{intro}</p>
      {landing.kind === "district" ? (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {DIVISION_NAMES_BN[landing.landing.division]} · প্রকাশিত প্রোফাইল {total} জন
        </p>
      ) : null}

      <TeacherDirectoryNav
        current={
          landing.kind === "district"
            ? "district"
            : landing.kind === "medium"
              ? "medium"
              : landing.kind === "institution"
                ? "institutions"
                : "exams"
        }
      />

      <p className="mt-3 max-w-3xl leading-8 text-slate-600 dark:text-slate-300">
        লগইন ছাড়াই প্রকাশিত প্রোফাইল দেখা যায়। পছন্দের শিক্ষককে অনুরোধ পাঠাতে অ্যাকাউন্ট লাগে।
        অভিভাবক লগইন ছাড়াই{" "}
        <Link href="/hire-tutor" className="font-medium text-brand-700 underline dark:text-brand-300">
          শিক্ষক চাই-এর ফর্ম
        </Link>{" "}
        পূরণ করতে পারেন।
      </p>

      <section className="mt-8" aria-labelledby="directory-howto-heading">
        <h2 id="directory-howto-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          কীভাবে শিক্ষক বেছে নেবেন
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm leading-7 text-slate-600 dark:text-slate-300">
          <li>নিচের প্রকাশিত প্রোফাইল দেখুন, অথবা বিষয় বেছে আরও নির্দিষ্ট করুন।</li>
          <li>যোগ্যতা, অভিজ্ঞতা, মাধ্যম (অনলাইন/সরাসরি) ও রিভিউ মিলিয়ে নিন।</li>
          <li>
            পছন্দ হলে প্রোফাইল খুলে অনুরোধ পাঠান। প্রথম সাক্ষাতে{" "}
            <Link href="/safety" className="font-medium text-brand-700 underline dark:text-brand-300">
              নিরাপত্তা নির্দেশিকা
            </Link>{" "}
            মেনে চলুন।
          </li>
        </ol>
      </section>

      {result.error ? (
        <p className="mt-8 text-sm text-red-600">{result.error}</p>
      ) : (
        <PublicTeacherResults
          teachers={teachers}
          total={total}
          page={page}
          totalPages={totalPages}
          buildHref={(p) => (p > 1 ? `${landing.landing.path}?page=${p}` : landing.landing.path)}
          emptyTitle={
            landing.kind === "district"
              ? `${landing.landing.nameBn}-এ এখন প্রকাশিত শিক্ষক নেই`
              : `${landing.landing.nameBn}-এ এখন প্রকাশিত শিক্ষক নেই`
          }
          emptyDescription="নতুন শিক্ষক প্রোফাইল প্রকাশ করলে এখানে দেখা যাবে। ইতিমধ্যে অন্য এলাকা বা অনলাইন শিক্ষক দেখতে পারেন।"
          listName={landingTitle(landing)}
          listPath={landing.landing.path}
        />
      )}

      <section className="mt-10" aria-labelledby="directory-subjects-heading">
        <h2 id="directory-subjects-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          বিষয় অনুযায়ী শিক্ষক
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {SUBJECT_LANDINGS.slice(0, 14).map((subject) => (
            <li key={subject.slug}>
              <Link
                href={subject.path}
                className="inline-flex min-h-10 items-center rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:border-brand-300 hover:text-brand-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {subject.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {otherExams.length > 0 && (
        <section className="mt-8" aria-labelledby="directory-exams-heading">
          <h2 id="directory-exams-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            পরীক্ষা ও শ্রেণি অনুযায়ী
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {otherExams.map((exam) => (
              <li key={exam.slug}>
                <Link
                  href={exam.path}
                  className="inline-flex min-h-10 items-center rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:border-brand-300 hover:text-brand-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  {exam.nameBn} ({exam.name})
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {otherMediums.length > 0 && (
        <section className="mt-8" aria-labelledby="directory-mediums-heading">
          <h2 id="directory-mediums-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            মাধ্যম অনুযায়ী শিক্ষক
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {otherMediums.map((medium) => (
              <li key={medium.slug}>
                <Link
                  href={medium.path}
                  className="inline-flex min-h-10 items-center rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:border-brand-300 hover:text-brand-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  {medium.nameBn} ({medium.name})
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {otherInstitutions.length > 0 && (
        <section className="mt-8" aria-labelledby="directory-institutions-heading">
          <h2 id="directory-institutions-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            প্রতিষ্ঠান অনুযায়ী শিক্ষক
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {otherInstitutions.map((institution) => (
              <li key={institution.slug}>
                <Link
                  href={institution.path}
                  className="inline-flex min-h-10 items-center rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:border-brand-300 hover:text-brand-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  {institution.nameBn} ({institution.name})
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8" aria-labelledby="directory-districts-heading">
        <h2 id="directory-districts-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {landing.kind === "district" ? `${DIVISION_NAMES_BN[landing.landing.division]}-এর অন্যান্য জেলা` : "জেলা অনুযায়ী শিক্ষক"}
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {siblingDistricts.map((district) => (
            <li key={district.slug}>
              <Link
                href={district.path}
                className="inline-flex min-h-10 items-center rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:border-brand-300 hover:text-brand-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {district.possessiveBn} শিক্ষক
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/locations"
          className="mt-3 inline-flex min-h-10 items-center text-sm font-medium text-brand-700 underline dark:text-brand-300"
        >
          সব জেলার তালিকা দেখুন
        </Link>
      </section>

      <FaqList
        items={
          landing.kind === "district"
            ? [
                {
                  question: `PoraSathi-তে ${landing.landing.nameBn}-এর শিক্ষক কি পাওয়া যায়?`,
                  answer: `${landing.landing.nameBn} জেলার প্রকাশিত শিক্ষক প্রোফাইল এই পাতায় দেখা যায়। প্রোফাইলে যোগ্যতা, অভিজ্ঞতা ও পড়ানোর মাধ্যম লেখা থাকে। কেউ প্রকাশিত না থাকলে অনলাইন শিক্ষক দেখা যেতে পারে।`,
                },
                {
                  question: `${landing.landing.nameBn}-এ হোম টিউটর ও অনলাইন শিক্ষক দুটোই কি আছে?`,
                  answer: "শিক্ষক প্রোফাইলে মাধ্যম লেখা থাকে — সরাসরি, অনলাইন অথবা দুইভাবেই। আপনার সুবিধা অনুযায়ী বেছে নিন।",
                },
                {
                  question: "লগইন ছাড়া কি শিক্ষক খোঁজা যায়?",
                  answer: "হ্যাঁ, প্রকাশিত প্রোফাইল লগইন ছাড়াই দেখা যায়। অনুরোধ বা মেসেজ পাঠাতে অ্যাকাউন্ট লাগে। অভিভাবক চাইলে লগইন ছাড়াই 'শিক্ষক চাই' ফর্ম পূরণ করতে পারেন।",
                },
              ]
            : [
                {
                  question:
                    landing.kind === "medium"
                      ? `${landing.landing.nameBn} শিক্ষক কীভাবে খুঁজব?`
                      : landing.kind === "institution"
                        ? `${landing.landing.nameBn}-এর শিক্ষক কীভাবে খুঁজব?`
                        : `${landing.landing.nameBn} প্রস্তুতির জন্য শিক্ষক কীভাবে খুঁজব?`,
                  answer:
                    landing.kind === "medium"
                      ? `এই পাতায় ${landing.landing.nameBn}-এ পড়ান এমন প্রকাশিত শিক্ষক প্রোফাইল আছে। প্রোফাইলে যোগ্যতা, অভিজ্ঞতা ও এলাকা লেখা থাকে। বিষয় বা জেলা যোগ করে আরও নির্দিষ্ট করতে পারেন।`
                      : landing.kind === "institution"
                        ? `শিক্ষকরা প্রোফাইলে নিজের শিক্ষাগত প্রতিষ্ঠানের নাম লেখেন। এই পাতায় ${landing.landing.keyword} নামটি প্রোফাইলে আছে এমন প্রকাশিত শিক্ষক দেখানো হয়। নামের বানান ভিন্ন হলে শিক্ষক খোঁজার পাতায় প্রতিষ্ঠানের নাম লিখে খুঁজতে পারেন।`
                        : `এই পাতায় ${landing.landing.name} স্তরের পড়াশোনায় আগ্রহী প্রকাশিত শিক্ষক প্রোফাইল আছে। বিষয় বা জেলা যোগ করে আরও নির্দিষ্ট করতে পারেন।`,
                },
                {
                  question: "অনলাইনে কি পড়ানো হয়?",
                  answer: "অনেক শিক্ষক অনলাইন, সরাসরি বা দুইভাবেই পড়ান। প্রোফাইলের মাধ্যম দেখে বেছে নিন।",
                },
                {
                  question: "লগইন ছাড়া কি শিক্ষক খোঁজা যায়?",
                  answer: "হ্যাঁ, প্রকাশিত প্রোফাইল লগইন ছাড়াই দেখা যায়। অনুরোধ বা মেসেজ পাঠাতে অ্যাকাউন্ট লাগে। অভিভাবক চাইলে লগইন ছাড়াই 'শিক্ষক চাই' ফর্ম পূরণ করতে পারেন।",
                },
              ]
        }
      />
    </div>
  );
}
