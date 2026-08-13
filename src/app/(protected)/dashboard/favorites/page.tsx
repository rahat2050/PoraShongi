import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { listFavoriteIds } from "@/lib/data/favorites";
import { getPublicTeachers } from "@/lib/data/teachers";
import { TeacherCard } from "@/components/shared/teacher-card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonStyles } from "@/components/ui/button";

export const metadata: Metadata = { title: "Saved teachers" };

export default async function FavoritesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "student" && profile.role !== "guardian") {
    redirect("/dashboard");
  }

  const favResult = await listFavoriteIds(profile.id);
  const favIds = favResult.data ?? [];
  const teachers =
    favIds.length > 0 ? ((await getPublicTeachers(favIds)).data ?? []) : [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <Heart className="h-6 w-6 text-brand-600" aria-hidden />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Saved teachers</h1>
          <p className="mt-1 text-slate-500">
            Teachers you&apos;ve saved for later.
          </p>
        </div>
      </div>

      <div className="mt-6">
        {teachers.length === 0 ? (
          <EmptyState
            icon={<Heart className="h-6 w-6" aria-hidden />}
            title="No saved teachers yet"
            description="Browse teachers and save the ones you like."
            action={
              <Link href="/teachers" className={buttonStyles()}>
                Find teachers
              </Link>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                canSave
                initiallySaved
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
