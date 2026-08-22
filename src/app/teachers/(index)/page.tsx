import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { searchTeachers } from "@/lib/data/teachers";
import { listFavoriteTeacherIds } from "@/lib/data/favorites";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupRequired } from "@/components/shared/setup-required";
import { TeacherFilters } from "@/components/shared/teacher-filters";
import { TeacherCard } from "@/components/shared/teacher-card";
import { Reveal } from "@/components/motion/reveal";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { buildQueryString, firstParam } from "@/lib/utils";

export const metadata: Metadata = {
  title: "শিক্ষক খুঁজুন",
  description: "ক্লাস, বিষয়, মোড, অভিজ্ঞতা ও এলাকা অনুযায়ী PoraSathi-তে প্রকাশিত শিক্ষক খুঁজুন।",
  alternates: { canonical: "/teachers" },
  openGraph: {
    type: "website",
    url: "/teachers",
    title: "শিক্ষক খুঁজুন — PoraSathi",
    description: "ক্লাস, বিষয়, মোড, অভিজ্ঞতা ও এলাকা অনুযায়ী শিক্ষক খুঁজুন।",
  },
};

const PAGE_SIZE = 12;

export default async function TeachersPage({
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
  const gender = firstParam(sp.gender);
  const experience = firstParam(sp.experience);
  const minRating = firstParam(sp.minRating);
  const verified = firstParam(sp.verified);
  const sort = firstParam(sp.sort) ?? "relevance";
  const radius = firstParam(sp.radius);
  const page = Math.max(1, Number(firstParam(sp.page) ?? "1") || 1);

  if (!isSupabaseConfigured()) return <SetupRequired />;

  const profile = await getCurrentProfile();
  const canUseDistance =
    typeof profile?.latitude === "number" &&
    Number.isFinite(profile.latitude) &&
    typeof profile?.longitude === "number" &&
    Number.isFinite(profile.longitude);
  const effectiveSort = sort === "nearest" && !canUseDistance ? "relevance" : sort;
  const canSave = profile?.role === "student" || profile?.role === "guardian";

  const [result, favoriteResult] = await Promise.all([
    searchTeachers({
      classLevel: classLevel || undefined,
      subject: subject || undefined,
      district: district || undefined,
      area: area || undefined,
      lat: profile?.latitude ?? undefined,
      lon: profile?.longitude ?? undefined,
      maxDistanceKm: radius ? Number(radius) : undefined,
      mode: mode || undefined,
      gender: gender || undefined,
      minExperience: experience ? Number(experience) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      verified: verified === "1" ? true : undefined,
      sort: effectiveSort as "relevance" | "nearest" | "rating" | "experience" | "newest",
      page,
      pageSize: PAGE_SIZE,
    }),
    canSave && profile ? listFavoriteTeacherIds(profile.id) : Promise.resolve({ data: [] as string[] }),
  ]);

  const favoriteIds = new Set(favoriteResult.data ?? []);

  const total = result.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (p: number) =>
    `/teachers${buildQueryString({
      class: classLevel,
      subject,
      district,
      area,
      mode,
      gender,
      experience,
      minRating,
      verified,
      sort: effectiveSort !== "relevance" ? effectiveSort : undefined,
      radius: canUseDistance ? radius : undefined,
      page: p > 1 ? p : undefined,
    })}`;

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">শিক্ষক খুঁজুন</h1>
        <p className="mt-1 text-slate-500">ক্লাস, বিষয়, এলাকা, মাধ্যম ও অভিজ্ঞতা অনুযায়ী শিক্ষক খুঁজুন।</p>
      </div>

      <TeacherFilters
        current={{
          classLevel,
          subject,
          district,
          area,
          mode,
          gender,
          experience,
          minRating,
          verified,
          sort: effectiveSort,
          radius: canUseDistance ? radius : undefined,
        }}
        canUseDistance={canUseDistance}
      />

      <div className="mt-6">
        {result.error ? (
          <EmptyState icon={<SearchX className="h-6 w-6" aria-hidden />} title="শিক্ষক লোড করা যায়নি" description={result.error} />
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-500">{total} জন শিক্ষক পাওয়া গেছে</p>
            {total > 0 && result.data ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {result.data.results.map((teacher, index) => (
                  <Reveal key={teacher.id} delay={Math.min(index * 70, 350)} className="h-full">
                    <TeacherCard teacher={teacher} canSave={canSave} initiallySaved={favoriteIds.has(teacher.id)} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<SearchX className="h-6 w-6" aria-hidden />}
                title="এখনই কোনো উপযুক্ত শিক্ষক পাওয়া যায়নি"
                description="ফিল্টার বদলে দেখুন — অথবা নতুন শিক্ষক যুক্ত হলে খুঁজে নিন।"
              />
            )}
            <div className="mt-8">
              <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
