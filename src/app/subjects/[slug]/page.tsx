import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { FaqList } from "@/components/seo/faq-list";
import { JsonLd } from "@/components/seo/json-ld";
import { PublicTeacherResults } from "@/components/seo/public-teacher-results";
import { FEATURED_LOCATIONS, SUBJECT_LANDINGS, getSubjectLandingBySlug } from "@/config/seo";
import { searchTeachers } from "@/lib/data/teachers";
import { isSupabaseConfigured } from "@/lib/env";
import { TeacherDirectoryNav } from "@/components/seo/teacher-directory-nav";
import { localTutorCollectionJsonLd } from "@/lib/seo/jsonld";
import { paginatedDirectoryMetadata } from "@/lib/seo/metadata";
import { firstParam } from "@/lib/utils";

export const revalidate = 300;
const PAGE_SIZE = 12;

export function generateStaticParams() {
  return SUBJECT_LANDINGS.map((subject) => ({ slug: subject.slug }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { slug } = await params;
  const subject = getSubjectLandingBySlug(slug);
  if (!subject) notFound();
  const page = Math.max(1, Number(firstParam((await searchParams).page) ?? "1") || 1);

  return paginatedDirectoryMetadata({
    title: `${subject.name} Tutors & Tuition in Bangladesh`,
    description: `Find published ${subject.name} tutors on PoraSathi. Compare subjects, classes, teaching mode and location, then connect securely.`,
    path: subject.path,
    page,
  });
}

export default async function SubjectLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const subject = getSubjectLandingBySlug(slug);
  if (!subject) notFound();

  const page = Math.max(1, Number(firstParam((await searchParams).page) ?? "1") || 1);
  const result = isSupabaseConfigured()
    ? await searchTeachers({
        subject: subject.name,
        page,
        pageSize: PAGE_SIZE,
        sort: "relevance",
      })
    : { data: { total: 0, results: [] }, error: null };
  const total = result.data?.total ?? 0;
  const teachers = result.data?.results ?? [];
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const crumbs = [
    { name: "হোম", path: "/" },
    { name: "বিষয়", path: "/subjects" },
    { name: subject.name },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <JsonLd
        data={localTutorCollectionJsonLd({
          name: `${subject.name} tutors in Bangladesh`,
          path: subject.path,
          description: `Published ${subject.name} teacher profiles on PoraSathi.`,
        })}
      />
      <Breadcrumbs items={crumbs} />
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        {subject.name} tutors in Bangladesh
      </h1>
      <p className="mt-3 max-w-3xl leading-8 text-slate-600 dark:text-slate-300">
        PoraSathi-তে {subject.name} পড়ান এমন প্রকাশিত শিক্ষক দেখুন। প্রোফাইলে যোগ্যতা, ক্লাস, মাধ্যম ও এলাকা থাকে। যোগাযোগের জন্য লগইন লাগে; খোলা টিউশন পোস্ট শিক্ষকের অ্যাকাউন্ট থেকে দেখা যায়।
      </p>
      <TeacherDirectoryNav current="subjects" />

      <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {FEATURED_LOCATIONS.map((location) => (
          <Link key={location.slug} href={location.path} className="font-medium text-brand-700 underline dark:text-brand-300">
            {location.possessiveBn} শিক্ষক
          </Link>
        ))}
        <Link href="/teachers" className="font-medium text-brand-700 underline dark:text-brand-300">সব শিক্ষক</Link>
      </p>

      {result.error ? (
        <p className="mt-8 text-sm text-red-600">{result.error}</p>
      ) : (
        <PublicTeacherResults
          teachers={teachers}
          total={total}
          page={page}
          totalPages={totalPages}
          buildHref={(p) => (p > 1 ? `${subject.path}?page=${p}` : subject.path)}
          emptyTitle={`এখন ${subject.name} শিক্ষক প্রকাশিত নেই`}
          emptyDescription="নতুন শিক্ষক প্রোফাইল প্রকাশ করলে এই পাতায় দেখা যাবে।"
        />
      )}

      <FaqList
        items={[
          {
            question: `PoraSathi-তে ${subject.name} শিক্ষক কীভাবে খুঁজব?`,
            answer: `এই পাতায় ${subject.name} বিষয়ে প্রকাশিত প্রোফাইল আছে। আরও ছেঁকে দেখতে শিক্ষক খোঁজার পাতায় ক্লাস বা জেলা যোগ করুন।`,
          },
          {
            question: "অনলাইন শিক্ষক কি পাওয়া যায়?",
            answer: "অনেক শিক্ষক অনলাইন, সরাসরি বা দুইভাবেই পড়ান। প্রোফাইলের মাধ্যম দেখে বেছে নিন।",
          },
        ]}
      />
    </div>
  );
}
