import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, SearchX, Sparkles } from "lucide-react";
import { searchPublicTuitions, searchTuitions } from "@/lib/data/tuitions";
import { getCurrentUser } from "@/lib/auth/server-auth";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupRequired } from "@/components/shared/setup-required";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { FaqList } from "@/components/seo/faq-list";
import { JsonLd } from "@/components/seo/json-ld";
import { TuitionFilters } from "@/components/shared/tuition-filters";
import { TuitionCard } from "@/components/shared/tuition-card";
import { TuitionTeaserCard } from "@/components/shared/tuition-teaser-card";
import { Reveal } from "@/components/motion/reveal";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { buttonStyles } from "@/components/ui/button";
import { tuitionItemListJsonLd } from "@/lib/seo/jsonld";
import { paginatedDirectoryMetadata } from "@/lib/seo/metadata";
import { buildQueryString, firstParam } from "@/lib/utils";

const PAGE_SIZE = 12;

/** A filtered permutation is useful to humans but must not be indexed. */
function hasFacetFilters(sp: Record<string, string | string[] | undefined>): boolean {
  return Boolean(
    firstParam(sp.class) ||
      firstParam(sp.subject) ||
      firstParam(sp.district) ||
      firstParam(sp.area) ||
      firstParam(sp.mode) ||
      firstParam(sp.day) ||
      firstParam(sp.time) ||
      firstParam(sp.minBudget) ||
      firstParam(sp.maxBudget),
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const page = Math.max(1, Number(firstParam(sp.page) ?? "1") || 1);

  if (hasFacetFilters(sp)) {
    return {
      title: "টিউশন খুঁজুন",
      description: "ক্লাস, বিষয় ও এলাকা অনুযায়ী খোলা টিউশন সুযোগ দেখুন।",
      robots: { index: false, follow: true },
      alternates: { canonical: "/tuitions" },
    };
  }

  return paginatedDirectoryMetadata({
    title: "টিউশন জব — বাংলাদেশে খোলা টিউশন সুযোগ",
    description:
      "PoraSathi-তে অভিভাবক ও শিক্ষার্থীর পোস্ট করা খোলা টিউশন দেখুন। ক্লাস, বিষয়, এলাকা, বাজেট ও সময় অনুযায়ী ফিল্টার করুন — দেখতে লগইন লাগে না।",
    path: "/tuitions",
    page,
  });
}

export const revalidate = 120;

export default async function TuitionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const classLevel = firstParam(sp.class);
  const subject = firstParam(sp.subject);
  const district = firstParam(sp.district);
  const area = firstParam(sp.area);
  const mode = firstParam(sp.mode);
  const day = firstParam(sp.day);
  const time = firstParam(sp.time);
  const minBudget = firstParam(sp.minBudget);
  const maxBudget = firstParam(sp.maxBudget);
  const page = Math.max(1, Number(firstParam(sp.page) ?? "1") || 1);

  if (!isSupabaseConfigured()) return <SetupRequired />;

  const filters = {
    classLevel: classLevel || undefined,
    subject: subject || undefined,
    district: district || undefined,
    area: area || undefined,
    mode: mode || undefined,
    day: day || undefined,
    time: time || undefined,
    minBudget: minBudget ? Number(minBudget) : undefined,
    maxBudget: maxBudget ? Number(maxBudget) : undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  // Signed-in users get the full record (poster, requirements); anonymous
  // visitors get the privacy-safe teaser so the page can be indexed.
  const user = await getCurrentUser();
  const [privateResult, publicResult] = await Promise.all([
    user ? searchTuitions(filters) : Promise.resolve(null),
    user ? Promise.resolve(null) : searchPublicTuitions(filters),
  ]);

  const result = privateResult ?? publicResult!;
  const total = result.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (p: number) =>
    `/tuitions${buildQueryString({
      class: classLevel,
      subject,
      district,
      area,
      mode,
      day,
      time,
      minBudget,
      maxBudget,
      page: p > 1 ? p : undefined,
    })}`;

  return (
    <div className="mx-auto w-full min-h-[50vh] max-w-6xl flex-1 px-4 py-10 sm:px-6">
      {!user && publicResult?.data && publicResult.data.results.length > 0 && (
        <JsonLd
          data={tuitionItemListJsonLd({
            name: "খোলা টিউশন সুযোগ",
            path: "/tuitions",
            tuitions: publicResult.data.results,
            total,
            page,
            pageSize: PAGE_SIZE,
          })}
        />
      )}

      <Breadcrumbs items={[{ name: "হোম", path: "/" }, { name: "টিউশন" }]} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">টিউশন জব খুঁজুন</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          অভিভাবক ও শিক্ষার্থীর পোস্ট করা খোলা টিউশন। ক্লাস, বিষয়, এলাকা ও বাজেট অনুযায়ী ফিল্টার করুন।
        </p>
      </div>

      {!user && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-brand-800 dark:bg-brand-950/40">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-bold text-brand-900 dark:text-brand-100">
              <Sparkles className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
              শিক্ষক হিসেবে আবেদন করতে চান?
            </p>
            <p className="mt-1 text-sm leading-6 text-brand-800 dark:text-brand-200">
              ফ্রি অ্যাকাউন্ট খুললে পোস্টদাতার বিস্তারিত দেখতে ও সরাসরি আবেদন করতে পারবেন।
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link href="/register" className={buttonStyles({ size: "sm" })}>ফ্রি রেজিস্টার</Link>
            <Link href="/login?next=/tuitions" className={buttonStyles({ variant: "outline", size: "sm" })}>লগইন</Link>
          </div>
        </div>
      )}

      <TuitionFilters current={{ classLevel, subject, district, area, mode, day, time, minBudget, maxBudget }} />

      <div className="mt-6">
        {result.error ? (
          <EmptyState icon={<SearchX className="h-6 w-6" aria-hidden />} title="টিউশন লোড করা যায়নি" description={result.error} />
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{total}টি টিউশন পাওয়া গেছে</p>
            {total > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {privateResult?.data
                  ? privateResult.data.results.map((tuition, index) => (
                      <Reveal key={tuition.id} delay={Math.min(index * 70, 350)} className="h-full">
                        <TuitionCard tuition={tuition} />
                      </Reveal>
                    ))
                  : publicResult?.data?.results.map((tuition, index) => (
                      <Reveal key={tuition.id} delay={Math.min(index * 70, 350)} className="h-full">
                        <TuitionTeaserCard tuition={tuition} />
                      </Reveal>
                    ))}
              </div>
            ) : (
              <EmptyState
                icon={<ClipboardList className="h-6 w-6" aria-hidden />}
                title="কোনো টিউশন পাওয়া যায়নি"
                description="ফিল্টার বদলে দেখুন, অথবা নিজের প্রয়োজন জানিয়ে অনুরোধ পাঠান।"
                action={<Link href="/hire-tutor" className={buttonStyles({ size: "sm" })}>শিক্ষক চেয়ে অনুরোধ করুন</Link>}
              />
            )}
            <div className="mt-8">
              <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
            </div>
          </>
        )}
      </div>

      {!user && (
        <FaqList
          items={[
            {
              question: "টিউশন দেখতে কি অ্যাকাউন্ট লাগে?",
              answer:
                "না। খোলা টিউশনের ক্লাস, বিষয়, এলাকা, বাজেট ও সময় যে কেউ দেখতে পারেন। তবে পোস্টদাতার পরিচয় ও যোগাযোগের সুযোগ শুধু লগইন করা শিক্ষকদের জন্য।",
            },
            {
              question: "টিউশনে আবেদন করব কীভাবে?",
              answer:
                "শিক্ষক হিসেবে ফ্রি অ্যাকাউন্ট খুলে প্রোফাইল সম্পূর্ণ করুন, তারপর পছন্দের টিউশনে আবেদন পাঠান। প্রোফাইল যত সম্পূর্ণ, সাড়া পাওয়ার সম্ভাবনা তত বেশি।",
            },
            {
              question: "আমি অভিভাবক — টিউশন পোস্ট করব কীভাবে?",
              answer:
                "অ্যাকাউন্ট খুলে ড্যাশবোর্ড থেকে টিউশন পোস্ট করুন। তাড়াহুড়ো থাকলে লগইন ছাড়াই /hire-tutor পাতা থেকে অনুরোধ পাঠাতে পারেন — আমাদের টিম শিক্ষক বাছাই করে দেবে।",
            },
          ]}
        />
      )}
    </div>
  );
}
