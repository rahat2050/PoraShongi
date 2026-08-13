import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Briefcase,
  CalendarDays,
  Clock,
  GraduationCap,
  MapPin,
  Star,
  Wallet,
} from "lucide-react";
import {
  getPublicTeacher,
  getTeacherReputation,
  getTeacherReviews,
} from "@/lib/data/teachers";
import { listTuitionsFor } from "@/lib/data/tuitions";
import { isFavorite } from "@/lib/data/favorites";
import { hasReviewed, hasAcceptedInteraction } from "@/lib/data/reviews";
import { isBlocked } from "@/lib/data/blocks";
import { getCurrentUser, getCurrentProfile } from "@/lib/auth/server-auth";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupRequired } from "@/components/shared/setup-required";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestSheet } from "@/components/shared/request-sheet";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { MessageButton } from "@/components/shared/message-button";
import { BlockButton } from "@/components/shared/block-button";
import { ReportButton } from "@/components/shared/report-dialog";
import { ReputationCard } from "@/components/shared/reputation-card";
import { ReviewList } from "@/components/shared/review-list";
import { ReviewForm } from "@/components/shared/review-form";
import { VerificationTierBadge } from "@/components/shared/verification-tier";
import { Pagination } from "@/components/ui/pagination";
import { buttonStyles } from "@/components/ui/button";
import { formatTaka, modeLabel } from "@/lib/utils";

export const metadata: Metadata = { title: "Teacher profile" };

const REVIEW_PAGE_SIZE = 6;

export default async function TeacherProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const reviewPage = Math.max(1, Number(sp.reviews ?? "1") || 1);

  if (!isSupabaseConfigured()) return <SetupRequired />;

  const result = await getPublicTeacher(id);
  const teacher = result.data ?? null;
  if (!teacher) notFound();

  const name = teacher.display_name || teacher.full_name || "Teacher";

  const [reputationResult, reviewsResult] = await Promise.all([
    getTeacherReputation(teacher.id),
    getTeacherReviews(teacher.id, reviewPage, REVIEW_PAGE_SIZE),
  ]);
  const reputation = reputationResult.data;
  const reviewsData = reviewsResult.data;
  const reviewTotalPages = Math.max(1, Math.ceil((reviewsData?.total ?? 0) / REVIEW_PAGE_SIZE));

  const user = await getCurrentUser();
  const profile = user ? await getCurrentProfile() : null;
  const isStudentOrGuardian = profile?.role === "student" || profile?.role === "guardian";

  let canRequest = false;
  let canReview = false;
  let saved = false;
  let blocked = false;
  let openTuitions: { id: string; title: string }[] = [];

  if (isStudentOrGuardian && profile) {
    const [tuitionsRes, favRes, reviewedRes, interactionRes, blockedRes] = await Promise.all([
      listTuitionsFor(profile.id),
      isFavorite(profile.id, teacher.id),
      hasReviewed(profile.id, teacher.id),
      hasAcceptedInteraction(profile.id, teacher.id),
      isBlocked(profile.id, teacher.id),
    ]);
    openTuitions = (tuitionsRes.data ?? [])
      .filter((t) => t.status === "open")
      .map((t) => ({ id: t.id, title: t.title }));
    canRequest = openTuitions.length > 0;
    saved = favRes.data ?? false;
    canReview = (interactionRes.data ?? false) && !(reviewedRes.data ?? false);
    blocked = blockedRes.data ?? false;
  }

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row">
            <Avatar src={teacher.avatar_url} name={name} size="xl" />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
                {teacher.tier && <VerificationTierBadge tier={teacher.tier} />}
              </div>
              <p className="mt-1 text-slate-600">{teacher.headline || "Tuition teacher"}</p>
              {reputation && reputation.review_count > 0 && (
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                  {reputation.rating_avg} · {reputation.review_count} review
                  {reputation.review_count === 1 ? "" : "s"}
                </p>
              )}

              <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <Detail
                  icon={<GraduationCap className="h-4 w-4" />}
                  label="Education"
                  value={[teacher.education, teacher.institution].filter(Boolean).join(", ") || "—"}
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

          <div className="mt-6 flex flex-wrap gap-2">
            {isStudentOrGuardian && profile ? (
              <>
                {canRequest && !blocked && (
                  <RequestSheet
                    teacherId={teacher.id}
                    teacherName={name}
                    tuitions={openTuitions}
                  />
                )}
                {!blocked && (
                  <MessageButton otherId={teacher.id} />
                )}
                <FavoriteButton teacherId={teacher.id} initiallySaved={saved} />
              </>
            ) : profile?.role === "teacher" || profile?.id === teacher.id ? null : (
              <Link href={`/login?next=/teachers/${teacher.id}`} className={buttonStyles()}>
                Sign in to interact
              </Link>
            )}
            {profile && profile.id !== teacher.id && (
              <>
                <BlockButton otherId={teacher.id} initiallyBlocked={blocked} />
                <ReportButton targetType="teacher" targetId={teacher.id} label="Report" />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {reputation && <ReputationCard reputation={reputation} className="mt-6" />}

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
            <h2 className="mt-6 text-base font-semibold text-slate-900">Classes taught</h2>
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
                <h2 className="mt-6 text-base font-semibold text-slate-900">Qualifications</h2>
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
              {teacher.available_days?.length ? teacher.available_days.join(", ") : "Flexible"}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {teacher.available_time || "Flexible time"}
            </p>

            <h2 className="mt-6 text-base font-semibold text-slate-900">About</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {teacher.bio || "No bio provided yet."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Reviews ({reviewsData?.total ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {canReview && profile && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-800">Rate this teacher</h3>
              <div className="mt-3">
                <ReviewForm teacherId={teacher.id} />
              </div>
            </div>
          )}

          {reviewsData && reviewsData.results.length > 0 ? (
            <>
              <ReviewList reviews={reviewsData.results} />
              <div className="mt-6">
                <Pagination
                  page={reviewPage}
                  totalPages={reviewTotalPages}
                  buildHref={(p) => `/teachers/${teacher.id}?reviews=${p}`}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400">No reviews yet.</p>
          )}
        </CardContent>
      </Card>
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
