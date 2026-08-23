import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { FaqList } from "@/components/seo/faq-list";
import { JsonLd } from "@/components/seo/json-ld";
import { PublicTeacherResults } from "@/components/seo/public-teacher-results";
import { FEATURED_LOCATIONS, SUBJECT_LANDINGS, getFeaturedLocationBySlug } from "@/config/seo";
import { searchTeachers } from "@/lib/data/teachers";
import { isSupabaseConfigured } from "@/lib/env";
import { TeacherDirectoryNav } from "@/components/seo/teacher-directory-nav";
import { localTutorCollectionJsonLd } from "@/lib/seo/jsonld";
import { paginatedDirectoryMetadata } from "@/lib/seo/metadata";
import { firstParam } from "@/lib/utils";

const PAGE_SIZE = 12;

export function locationPageMetadata(slug: string, page = 1): Metadata {
  const location = getFeaturedLocationBySlug(slug);
  if (!location) return { title: "Location" };

  return paginatedDirectoryMetadata({
    title: `Private Tutors & Tuition in ${location.name}`,
    description: `${location.nameBn} (${location.name})-এ প্রাইভেট শিক্ষক, হোম টিউটর ও অনলাইন শিক্ষক খুঁজুন। PoraSathi-তে প্রকাশিত প্রোফাইল দেখে নিরাপদে সংযোগ করুন।`,
    path: location.path,
    page,
  });
}

export async function LocationTeachersPage({
  slug,
  searchParams,
}: {
  slug: string;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const location = getFeaturedLocationBySlug(slug);
  if (!location) notFound();

  const page = Math.max(1, Number(firstParam((await searchParams).page) ?? "1") || 1);
  const result = isSupabaseConfigured()
    ? await searchTeachers({
        district: location.name,
        page,
        pageSize: PAGE_SIZE,
        sort: "relevance",
      })
    : { data: { total: 0, results: [] }, error: null };
  const total = result.data?.total ?? 0;
  const teachers = result.data?.results ?? [];
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const otherLocations = FEATURED_LOCATIONS.filter((item) => item.slug !== location.slug);

  const crumbs = [
    { name: "হোম", path: "/" },
    { name: "শিক্ষক", path: "/teachers" },
    { name: location.nameBn },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <JsonLd
        data={localTutorCollectionJsonLd({
          name: `Private tutors in ${location.name}`,
          path: location.path,
          description: location.blurb,
        })}
      />
      <Breadcrumbs items={crumbs} />
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        {location.possessiveBn} প্রাইভেট শিক্ষক ও টিউশন
      </h1>
      <p className="mt-3 max-w-3xl leading-8 text-slate-600 dark:text-slate-300">{location.blurb}</p>
      <TeacherDirectoryNav current={location.slug} />
      <p className="mt-3 max-w-3xl leading-8 text-slate-600 dark:text-slate-300">
        লগইন ছাড়াই প্রকাশিত প্রোফাইল দেখা যায়। পছন্দের শিক্ষককে অনুরোধ পাঠাতে অ্যাকাউন্ট লাগে। শিক্ষকরা লগইন করে {location.nameBn} ও অন্য এলাকার খোলা টিউশন দেখতে পারেন — সেই তালিকা সার্চ ইঞ্জিনে ইনডেক্স করা হয় না।
      </p>

      <section className="mt-8" aria-labelledby="find-tutor-heading">
        <h2 id="find-tutor-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {location.nameBn}-এ শিক্ষক কীভাবে খুঁজবেন
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm leading-7 text-slate-600 dark:text-slate-300">
          <li>নিচের প্রকাশিত প্রোফাইল দেখুন, অথবা বিষয় বেছে আরও নির্দিষ্ট করুন।</li>
          <li>যোগ্যতা, অভিজ্ঞতা, মাধ্যম (অনলাইন/সরাসরি) ও রিভিউ মিলিয়ে নিন।</li>
          <li>পছন্দ হলে প্রোফাইল খুলে অনুরোধ পাঠান। প্রথম সাক্ষাতে <Link href="/safety" className="font-medium text-brand-700 underline dark:text-brand-300">নিরাপত্তা নির্দেশিকা</Link> মেনে চলুন।</li>
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
          buildHref={(p) => (p > 1 ? `${location.path}?page=${p}` : location.path)}
          emptyTitle={`${location.nameBn}-এ এখন প্রকাশিত শিক্ষক নেই`}
          emptyDescription="নতুন শিক্ষক প্রোফাইল প্রকাশ করলে এখানে দেখা যাবে। ইতিমধ্যে অন্য এলাকা বা অনলাইন শিক্ষক দেখতে পারেন।"
          listName={`Private tutors in ${location.name}`}
          listPath={location.path}
        />
      )}

      <section className="mt-10" aria-labelledby="subject-links-heading">
        <h2 id="subject-links-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">বিষয় অনুযায়ী দেখুন</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {SUBJECT_LANDINGS.slice(0, 12).map((subject) => (
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

      {otherLocations.length > 0 && (
        <p className="mt-8 text-sm text-slate-600 dark:text-slate-300">
          অন্য এলাকা:{" "}
          {otherLocations.map((item, index) => (
            <span key={item.slug}>
              {index > 0 ? " · " : null}
              <Link href={item.path} className="font-medium text-brand-700 underline dark:text-brand-300">
                {item.possessiveBn} শিক্ষক
              </Link>
            </span>
          ))}
        </p>
      )}

      <FaqList
        items={[
          {
            question: `PoraSathi কি ${location.nameBn}-এ পাওয়া যায়?`,
            answer: `হ্যাঁ। ${location.name} PoraSathi-র প্রাথমিক বাজারের অংশ। এখানে প্রকাশিত শিক্ষক প্রোফাইল দেখা যায় এবং লগইন করে সংযোগ করা যায়।`,
          },
          {
            question: "হোম টিউটর ও অনলাইন শিক্ষক দুটোই কি আছে?",
            answer: "শিক্ষক প্রোফাইলে মাধ্যম লেখা থাকে — সরাসরি, অনলাইন অথবা দুইভাবেই। আপনার সুবিধা অনুযায়ী বেছে নিন।",
          },
        ]}
      />
    </div>
  );
}
