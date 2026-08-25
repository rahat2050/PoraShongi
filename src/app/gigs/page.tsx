import type { Metadata } from "next";
import { Package } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { TeacherDirectoryNav } from "@/components/seo/teacher-directory-nav";
import { GigCard } from "@/components/shared/gig-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SUBJECT_LANDINGS } from "@/config/seo";
import { searchPublicGigs } from "@/lib/data/gigs";
import { isSupabaseConfigured } from "@/lib/env";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { firstParam } from "@/lib/utils";
import Link from "next/link";

export const revalidate = 300;

const PAGE_SIZE = 12;

export const metadata: Metadata = buildPageMetadata({
  title: "Tutor Packages & Gigs — Fixed-Price Teaching Offers",
  description:
    "শিক্ষকদের তৈরি fixed-price পড়ানোর প্যাকেজ দেখুন — বিষয়, সময়কাল, ক্লাস সংখ্যা ও দামসহ। PoraSathi-তে যাচাইকৃত শিক্ষকদের প্যাকেজ থেকে বেছে নিন।",
  path: "/gigs",
});

const crumbs = [
  { name: "হোম", path: "/" },
  { name: "শিক্ষক প্যাকেজ" },
];

export default async function GigsIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(firstParam(params.page) ?? "1") || 1);
  const subject = firstParam(params.subject) ?? "";

  const result = isSupabaseConfigured()
    ? await searchPublicGigs({
        subject: subject || undefined,
        page,
        pageSize: PAGE_SIZE,
        sort: "newest",
      })
    : { data: { total: 0, results: [] }, error: null };

  const total = result.data?.total ?? 0;
  const gigs = result.data?.results ?? [];
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (next: number) => {
    const query = new URLSearchParams();
    if (subject) query.set("subject", subject);
    if (next > 1) query.set("page", String(next));
    const qs = query.toString();
    return qs ? `/gigs?${qs}` : "/gigs";
  };

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Tutor packages in Bangladesh",
          description:
            "Fixed-price teaching packages created by verified tutors on PoraSathi.",
        }}
      />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        শিক্ষকদের প্যাকেজ
      </h1>
      <p className="mt-3 max-w-3xl leading-8 text-slate-600 dark:text-slate-300">
        এখানে শিক্ষকরা নিজেই তৈরি করা fixed-price পড়ানোর অফার দেখান — কী পড়ানো হবে, কত সপ্তাহে,
        সপ্তাহে কত ক্লাস, আর মোট দাম কত। টিউশন পোস্ট করার আগেই তুলনা করে নিতে পারবেন।
      </p>
      <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
        দাম শিক্ষকের নিজের নির্ধারণ করা। চূড়ান্ত শর্ত সরাসরি শিক্ষকের সঙ্গে কথা বলে ঠিক করুন এবং{" "}
        <Link href="/safety" className="font-medium text-brand-700 underline dark:text-brand-300">
          নিরাপত্তা নির্দেশিকা
        </Link>{" "}
        মেনে চলুন।
      </p>

      <TeacherDirectoryNav current="gigs" />

      <div className="mt-6 flex flex-wrap gap-2" aria-label="বিষয় অনুযায়ী ছাঁকুন">
        <Link
          href="/gigs"
          className={
            subject
              ? "inline-flex min-h-10 items-center rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              : "inline-flex min-h-10 items-center rounded-full border border-brand-700 bg-brand-700 px-3 text-sm font-semibold text-white"
          }
        >
          সব বিষয়
        </Link>
        {SUBJECT_LANDINGS.slice(0, 12).map((item) => {
          const active = subject === item.name;
          return (
            <Link
              key={item.slug}
              href={`/gigs?subject=${encodeURIComponent(item.name)}`}
              className={
                active
                  ? "inline-flex min-h-10 items-center rounded-full border border-brand-700 bg-brand-700 px-3 text-sm font-semibold text-white"
                  : "inline-flex min-h-10 items-center rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:border-brand-300 hover:text-brand-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              }
            >
              {item.name}
            </Link>
          );
        })}
      </div>

      {result.error ? (
        <p className="mt-8 text-sm text-red-600">{result.error}</p>
      ) : gigs.length === 0 ? (
        <EmptyState
          icon={<Package className="h-6 w-6" aria-hidden />}
          title={subject ? `${subject} বিষয়ে এখন কোনো প্যাকেজ নেই` : "এখন কোনো প্যাকেজ প্রকাশিত নেই"}
          description="শিক্ষকরা প্যাকেজ প্রকাশ করলে এখানে দেখা যাবে। ইতিমধ্যে প্রকাশিত শিক্ষক প্রোফাইল বা খোলা টিউশন দেখতে পারেন।"
          action={
            <Link
              href="/teachers"
              className="inline-flex min-h-10 items-center rounded-full bg-brand-700 px-4 text-sm font-semibold text-white"
            >
              শিক্ষক খুঁজুন
            </Link>
          }
        />
      ) : (
        <>
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">{total}টি প্যাকেজ</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gigs.map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
          <div className="mt-8">
            <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
          </div>
        </>
      )}
    </div>
  );
}
