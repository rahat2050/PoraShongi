import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { searchTeachers } from "@/lib/data/teachers";
import { listFavoriteIds } from "@/lib/data/favorites";
import { getCurrentUser, getCurrentProfile } from "@/lib/auth/server-auth";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupRequired } from "@/components/shared/setup-required";
import { TeacherFilters } from "@/components/shared/teacher-filters";
import { TeacherCard } from "@/components/shared/teacher-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { buildQueryString, firstParam } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Find teachers",
  description: "Search verified tuition teachers in Bangladesh.",
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
  const location = firstParam(sp.location);
  const mode = firstParam(sp.mode);
  const experience = firstParam(sp.experience);
  const verified = firstParam(sp.verified);

  const page = Math.max(1, Number(firstParam(sp.page) ?? "1") || 1);
  const filters = {
    classLevel: classLevel || undefined,
    subject: subject || undefined,
    location: location || undefined,
    mode: mode || undefined,
    minExperience: experience ? Number(experience) : undefined,
    verified: verified === "1" ? true : undefined,
  };

  if (!isSupabaseConfigured()) return <SetupRequired />;

  const result = await searchTeachers({ ...filters, page, pageSize: PAGE_SIZE });

  const user = await getCurrentUser();
  const profile = user ? await getCurrentProfile() : null;
  const canSave =
    profile?.role === "student" || profile?.role === "guardian";
  const favoriteIds = new Set(
    canSave ? (await listFavoriteIds(profile!.id)).data ?? [] : [],
  );

  const totalPages = Math.max(
    1,
    Math.ceil((result.data?.total ?? 0) / PAGE_SIZE),
  );

  const buildHref = (p: number) =>
    `/teachers${buildQueryString({
      class: classLevel,
      subject,
      location,
      mode,
      experience,
      verified,
      page: p > 1 ? p : undefined,
    })}`;

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Find teachers</h1>
        <p className="mt-1 text-slate-500">
          Search verified tuition teachers by class, subject, location and more.
        </p>
      </div>

      <TeacherFilters
        current={{
          classLevel,
          subject,
          location,
          experience,
          mode,
          verified,
        }}
      />

      <div className="mt-6">
        {result.error ? (
          <EmptyState
            icon={<SearchX className="h-6 w-6" aria-hidden />}
            title="Could not load teachers"
            description={result.error}
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-500">
              {result.data?.total ?? 0} teacher{result.data?.total === 1 ? "" : "s"} found
            </p>
            {result.data && result.data.results.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {result.data.results.map((teacher) => (
                  <TeacherCard
                    key={teacher.id}
                    teacher={teacher}
                    canSave={canSave}
                    initiallySaved={favoriteIds.has(teacher.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<SearchX className="h-6 w-6" aria-hidden />}
                title="No teachers found"
                description="Try adjusting your filters, or check back soon as more teachers join."
              />
            )}
            <div className="mt-8">
              <Pagination
                page={page}
                totalPages={totalPages}
                buildHref={buildHref}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
