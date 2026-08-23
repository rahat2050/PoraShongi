import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { FaqList } from "@/components/seo/faq-list";
import { JsonLd } from "@/components/seo/json-ld";
import { PublicTeacherResults } from "@/components/seo/public-teacher-results";
import { TeacherDirectoryNav } from "@/components/seo/teacher-directory-nav";
import { FEATURED_LOCATIONS } from "@/config/seo";
import { searchTeachers } from "@/lib/data/teachers";
import { isSupabaseConfigured } from "@/lib/env";
import { localTutorCollectionJsonLd } from "@/lib/seo/jsonld";
import { paginatedDirectoryMetadata } from "@/lib/seo/metadata";
import { firstParam } from "@/lib/utils";

export const revalidate = 300;
const PAGE_SIZE = 12;
const PATH = "/teachers/online";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const page = Math.max(1, Number(firstParam((await searchParams).page) ?? "1") || 1);
  return paginatedDirectoryMetadata({
    title: "Online Tutors in Bangladesh",
    description:
      "বাংলাদেশে অনলাইন প্রাইভেট শিক্ষক খুঁজুন। PoraSathi-তে অনলাইন বা দুইভাবে পড়ানো প্রকাশিত প্রোফাইল দেখে নিরাপদে সংযোগ করুন।",
    path: PATH,
    page,
  });
}

export default async function OnlineTeachersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const page = Math.max(1, Number(firstParam((await searchParams).page) ?? "1") || 1);
  const result = isSupabaseConfigured()
    ? await searchTeachers({
        mode: "online",
        page,
        pageSize: PAGE_SIZE,
        sort: "relevance",
      })
    : { data: { total: 0, results: [] }, error: null };
  const total = result.data?.total ?? 0;
  const teachers = result.data?.results ?? [];
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <JsonLd
        data={localTutorCollectionJsonLd({
          name: "Online tutors in Bangladesh",
          path: PATH,
          description: "Published online teacher profiles on PoraSathi.",
        })}
      />
      <Breadcrumbs items={[{ name: "হোম", path: "/" }, { name: "শিক্ষক", path: "/teachers" }, { name: "অনলাইন" }]} />
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        বাংলাদেশে অনলাইন শিক্ষক
      </h1>
      <p className="mt-3 max-w-3xl leading-8 text-slate-600 dark:text-slate-300">
        যে শিক্ষকরা অনলাইনে বা অনলাইন ও সরাসরি দুইভাবে পড়ান, তাদের প্রকাশিত প্রোফাইল এখানে দেখা যায়। এলাকার বাইরের শিক্ষার্থীও বিষয় ও ক্লাস মিলিয়ে শিক্ষক বেছে নিতে পারেন।
      </p>
      <TeacherDirectoryNav current="online" />

      <section className="mt-8" aria-labelledby="online-how-heading">
        <h2 id="online-how-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          অনলাইন টিউশন কীভাবে শুরু করবেন
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm leading-7 text-slate-600 dark:text-slate-300">
          <li>নিচের প্রোফাইলে বিষয়, ক্লাস, সময় ও মাধ্যম দেখুন।</li>
          <li>পছন্দ হলে লগইন করে অনুরোধ পাঠান। ক্লাসের লিংক প্ল্যাটফর্মের ভিতরে শেয়ার হয়।</li>
          <li>প্রথম ক্লাসের আগে <Link href="/safety" className="font-medium text-brand-700 underline dark:text-brand-300">নিরাপত্তা নির্দেশিকা</Link> পড়ে নিন।</li>
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
          buildHref={(p) => (p > 1 ? `${PATH}?page=${p}` : PATH)}
          emptyTitle="এখন অনলাইন শিক্ষক প্রকাশিত নেই"
          emptyDescription="নতুন শিক্ষক অনলাইন মাধ্যম যোগ করলে এই পাতায় দেখা যাবে।"
          listName="Online tutors in Bangladesh"
          listPath={PATH}
        />
      )}

      <p className="mt-8 text-sm text-slate-600 dark:text-slate-300">
        কাছের শিক্ষক খুঁজলে{" "}
        {FEATURED_LOCATIONS.map((location, index) => (
          <span key={location.slug}>
            {index > 0 ? " বা " : null}
            <Link href={location.path} className="font-medium text-brand-700 underline dark:text-brand-300">
              {location.possessiveBn} শিক্ষক
            </Link>
          </span>
        ))}{" "}
        দেখুন।
      </p>

      <FaqList
        items={[
          {
            question: "PoraSathi-তে অনলাইন শিক্ষক কি পাওয়া যায়?",
            answer: "হ্যাঁ। যে প্রোফাইলে মাধ্যম অনলাইন বা উভয়ই, সেগুলো এই পাতায় আসে। সরাসরি হোম টিউটর আলাদা এলাকা পাতায় খুঁজুন।",
          },
          {
            question: "অনলাইন ক্লাস কীভাবে হয়?",
            answer: "অনুরোধ গ্রহণের পর শিক্ষক মিটিং লিংক দিতে পারেন। লিংক শুধু সংশ্লিষ্ট সদস্যরা দেখেন।",
          },
        ]}
      />
    </div>
  );
}
