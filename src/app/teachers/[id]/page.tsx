import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Briefcase,
  CalendarDays,
  Clock,
  GraduationCap,
  MapPin,
  Phone,
  Wallet,
} from "lucide-react";
import { getPublicTeacher } from "@/lib/data/teachers";
import { listTuitionsFor } from "@/lib/data/tuitions";
import { isFavorite } from "@/lib/data/favorites";
import { getCurrentUser, getCurrentProfile } from "@/lib/auth/server-auth";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupRequired } from "@/components/shared/setup-required";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RequestSheet } from "@/components/shared/request-sheet";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { buttonStyles } from "@/components/ui/button";
import { formatTaka, modeLabel } from "@/lib/utils";

export const metadata: Metadata = { title: "Teacher profile" };

export default async function TeacherProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseConfigured()) return <SetupRequired />;

  const result = await getPublicTeacher(id);
  const teacher = result.data ?? null;
  if (!teacher) notFound();

  const name = teacher.display_name || teacher.full_name || "Teacher";

  const user = await getCurrentUser();
  const profile = user ? await getCurrentProfile() : null;
  const canInteract =
    profile?.role === "student" || profile?.role === "guardian";

  const openTuitions =
    canInteract && profile
      ? ((await listTuitionsFor(profile.id)).data ?? []).filter(
          (t) => t.status === "open",
        )
      : [];

  const saved =
    canInteract && profile
      ? (await isFavorite(profile.id, teacher.id)).data ?? false
      : false;

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row">
            <Avatar src={teacher.avatar_url} name={name} size="xl" />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
                {teacher.verification_status === "verified" && (
                  <Badge variant="success">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                    Verified
                  </Badge>
                )}
                {teacher.phone_verified && (
                  <Badge variant="info">
                    <Phone className="h-3 w-3" aria-hidden />
                    Phone verified
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-slate-600">
                {teacher.headline || "Tuition teacher"}
              </p>

              <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <Detail
                  icon={<GraduationCap className="h-4 w-4" />}
                  label="Education"
                  value={[teacher.education, teacher.institution]
                    .filter(Boolean)
                    .join(", ") || "—"}
                />
                <Detail
                  icon={<Briefcase className="h-4 w-4" />}
                  label="Experience"
                  value={
                    teacher.experience_years != null
                      ? `${teacher.experience_years} year${teacher.experience_years === 1 ? "" : "s"}`
                      : "—"
                  }
                />
                <Detail
                  icon={<MapPin className="h-4 w-4" />}
                  label="Location"
                  value={teacher.location || "—"}
                />
                <Detail
                  icon={<Wallet className="h-4 w-4" />}
                  label="Expected fee"
                  value={formatTaka(teacher.expected_salary)}
                />
                <Detail
                  icon={<Clock className="h-4 w-4" />}
                  label="Teaching mode"
                  value={modeLabel(teacher.teaching_mode)}
                />
                <Detail
                  icon={<MapPin className="h-4 w-4" />}
                  label="Teaching area"
                  value={teacher.teaching_area || "—"}
                />
              </dl>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {canInteract && profile ? (
              <>
                <RequestSheet
                  teacherId={teacher.id}
                  teacherName={name}
                  tuitions={openTuitions.map((t) => ({
                    id: t.id,
                    title: t.title,
                  }))}
                />
                <FavoriteButton
                  teacherId={teacher.id}
                  initiallySaved={saved}
                />
              </>
            ) : profile?.role === "teacher" ? (
              <p className="text-sm text-slate-500">
                You are signed in as a teacher.
              </p>
            ) : (
              <Link
                href={`/login?next=/teachers/${teacher.id}`}
                className={buttonStyles()}
              >
                Sign in to send a tuition request
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-base font-semibold text-slate-900">Subjects</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {teacher.subjects?.length ? (
                teacher.subjects.map((s) => (
                  <Badge key={s} variant="brand">
                    {s}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-slate-400">Not specified</p>
              )}
            </div>
            <h2 className="mt-6 text-base font-semibold text-slate-900">
              Classes taught
            </h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {teacher.classes_taught?.length ? (
                teacher.classes_taught.map((c) => (
                  <Badge key={c} variant="outline">
                    {c}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-slate-400">Not specified</p>
              )}
            </div>
            {teacher.qualifications && teacher.qualifications.length > 0 && (
              <>
                <h2 className="mt-6 text-base font-semibold text-slate-900">
                  Qualifications
                </h2>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {teacher.qualifications.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden />
              Availability
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {teacher.available_days?.length
                ? teacher.available_days.join(", ")
                : "Flexible"}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {teacher.available_time || "Flexible time"}
            </p>

            <h2 className="mt-6 text-base font-semibold text-slate-900">
              About
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {teacher.bio || "No bio provided yet."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div>
        <dt className="text-xs text-slate-400">{label}</dt>
        <dd className="text-slate-700">{value}</dd>
      </div>
    </div>
  );
}
