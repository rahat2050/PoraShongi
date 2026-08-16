import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Briefcase, CalendarDays, GraduationCap, MapPin, Star, Wallet } from "lucide-react";
import { getPublicTeacher } from "@/lib/data/teachers";
import { listTuitionsFor } from "@/lib/data/tuitions";
import { isFavorite } from "@/lib/data/favorites";
import { createClient } from "@/lib/supabase/server";
import { getTeacherReputation, getTeacherReviews, hasReviewed, hasAcceptedInteraction, isBlocked } from "@/lib/data/reviews";
import { getContactStatus, getTeacherPhone } from "@/lib/data/contact";
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
import { ContactRequestButton } from "@/components/shared/contact-request-button";
import { ShareButtons } from "@/components/shared/share-buttons";
import { ReviewList } from "@/components/shared/review-list";
import { ReviewForm } from "@/components/shared/review-form";
import { VerificationTierBadge } from "@/components/shared/verification-tier";
import { FastResponse } from "@/components/shared/fast-response";
import { TrialRequestButton } from "@/features/features-actions-ui";
import { recommendTeachers } from "@/lib/data/features";
import { TeacherCard } from "@/components/shared/teacher-card";
import { buttonStyles } from "@/components/ui/button";
import { formatTaka, modeLabel } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const result = await getPublicTeacher(id);
    const teacher = result.data;
    const name = teacher?.display_name || teacher?.full_name || "শিক্ষক";
    const subjects = teacher?.subjects?.slice(0, 3).join(", ") ?? "Tuition";
    return {
      title: `${name} — ${subjects} শিক্ষক`,
      description: `${name} (${subjects}) — ${teacher?.district ?? "বাংলাদেশ"} এলাকার শিক্ষক। PoraSathi-তে প্রোফাইল দেখুন।`,
      openGraph: {
        title: `${name} — PoraSathi শিক্ষক`,
        description: subjects,
      },
    };
  } catch {
    return { title: "শিক্ষকের প্রোফাইল" };
  }
}

export default async function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isSupabaseConfigured()) return <SetupRequired />;

  const result = await getPublicTeacher(id);
  const teacher = result.data ?? null;
  if (!teacher) notFound();

  const name = teacher.display_name || teacher.full_name || "শিক্ষক";

  const user = await getCurrentUser();
  const profile = user ? await getCurrentProfile() : null;
  const canInteract = profile?.role === "student" || profile?.role === "guardian";

  const openTuitions = canInteract && profile
    ? ((await listTuitionsFor(profile.id)).data ?? []).filter((t) => t.status === "open")
    : [];

  const [savedRes, reputation, reviews, reviewedRes, interactionRes, blockedRes, contactRes] = await Promise.all([
    canInteract && profile ? isFavorite(profile.id, teacher.id) : Promise.resolve({ data: false, error: null }),
    getTeacherReputation(teacher.id),
    getTeacherReviews(teacher.id, 1, 6),
    canInteract && profile ? hasReviewed(profile.id, teacher.id) : Promise.resolve({ data: false, error: null }),
    canInteract && profile ? hasAcceptedInteraction(profile.id, teacher.id) : Promise.resolve({ data: false, error: null }),
    canInteract && profile ? isBlocked(profile.id, teacher.id) : Promise.resolve({ data: false, error: null }),
    canInteract && profile ? getContactStatus(profile.id, teacher.id) : Promise.resolve({ data: null, error: null }),
  ]);

  const saved = savedRes.data ?? false;
  const reviewData = reviews.data;
  const canReview = (interactionRes.data ?? false) && !(reviewedRes.data ?? false);
  const blocked = blockedRes.data ?? false;
  const tier = reputation.data?.tier ?? "unverified";
  const contact = contactRes.data ?? null;
  const teacherPhone = contact?.status === "accepted" && profile
    ? (await getTeacherPhone(teacher.id)).data
    : null;

  // profile view count (নিজের ভিউ বাদ — শুধু অন্যের ভিউতে +1)
  if (!profile || profile.id !== teacher.id) {
    const supabase = await createClient();
    await supabase.rpc("record_profile_view", { p_teacher_id: teacher.id });
  }

  // Recommendation — একই subject/এলাকার আরও teacher
  const similar = (await recommendTeachers(teacher.id, 3)).data ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row">
            <Avatar src={teacher.avatar_url} name={name} size="xl" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
                <VerificationTierBadge tier={tier} />
                {teacher.is_premium && <Badge variant="accent">★ Premium</Badge>}
              </div>
              <p className="mt-1 text-slate-600">{teacher.headline || "Tuition শিক্ষক"}</p>
              {teacher.review_count ? (
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                  {teacher.rating_avg} · {teacher.review_count} রিভিউ
                </p>
              ) : null}
              {reputation.data && (
                <div className="mt-1 space-y-0.5">
                  <p className="text-xs text-slate-400">
                    {reputation.data.completed_tuitions} টা tuition সম্পন্ন · response {reputation.data.response_rate}%
                  </p>
                  <FastResponse avgHours={reputation.data.avg_response_hours} />
                </div>
              )}
              {teacher.trial_available && (
                <p className="mt-1 text-xs font-medium text-emerald-700">
                  🎓 Trial class আছে {teacher.trial_price != null && teacher.trial_price > 0 ? `(৳${teacher.trial_price})` : "(ফ্রি)"}
                </p>
              )}

              <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <Detail icon={<GraduationCap className="h-4 w-4" />} label="শিক্ষাগত যোগ্যতা" value={[teacher.education, teacher.institution].filter(Boolean).join(", ") || "—"} />
                <Detail icon={<Briefcase className="h-4 w-4" />} label="অভিজ্ঞতা" value={teacher.experience_years != null ? `${teacher.experience_years} বছর` : "—"} />
                <Detail icon={<MapPin className="h-4 w-4" />} label="এলাকা" value={[teacher.area, teacher.district].filter(Boolean).join(", ") || "—"} />
                <Detail icon={<Wallet className="h-4 w-4" />} label="প্রত্যাশিত ফি" value={formatTaka(teacher.expected_salary)} />
                <Detail icon={<CalendarDays className="h-4 w-4" />} label="মোড" value={modeLabel(teacher.teaching_mode)} />
              </dl>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {canInteract && profile ? (
              <>
                {!blocked && <RequestSheet teacherId={teacher.id} teacherName={name} tuitions={openTuitions.map((t) => ({ id: t.id, title: t.title }))} />}
                {!blocked && teacher.trial_available && <TrialRequestButton teacherId={teacher.id} price={teacher.trial_price ?? null} />}
                {!blocked && <MessageButton otherId={teacher.id} />}
                <FavoriteButton teacherId={teacher.id} initiallySaved={saved} />
                {!blocked && <ContactRequestButton teacherId={teacher.id} initialStatus={contact?.status ?? "none"} />}
                <BlockButton otherId={teacher.id} initiallyBlocked={blocked} />
                <ReportButton targetType="teacher" targetId={teacher.id} />
              </>
            ) : profile?.role === "teacher" ? (
              <p className="text-sm text-slate-500">আপনি শিক্ষক হিসেবে লগইন করেছেন।</p>
            ) : (
              <Link href={`/login?next=/teachers/${teacher.id}`} className={buttonStyles()}>
                request পাঠাতে লগইন করুন
              </Link>
            )}
          </div>

          {teacherPhone && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              📞 যোগাযোগ: <span className="font-semibold">{teacherPhone}</span>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
            <p className="text-xs text-slate-400">এই প্রোফাইলটি শেয়ার করুন:</p>
            <ShareButtons
              url={`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/teachers/${teacher.id}`}
              title={`${name} — PoraSathi`}
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-base font-semibold text-slate-900">বিষয়</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {teacher.subjects?.length ? teacher.subjects.map((s) => <Badge key={s} variant="brand">{s}</Badge>) : <p className="text-sm text-slate-400">উল্লেখ নেই</p>}
            </div>
            <h2 className="mt-6 text-base font-semibold text-slate-900">যে ক্লাস পড়ান</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {teacher.classes_taught?.length ? teacher.classes_taught.map((c) => <Badge key={c} variant="outline">{c}</Badge>) : <p className="text-sm text-slate-400">উল্লেখ নেই</p>}
            </div>
            {teacher.qualifications && teacher.qualifications.length > 0 && (
              <>
                <h2 className="mt-6 text-base font-semibold text-slate-900">যোগ্যতা</h2>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {teacher.qualifications.map((q) => <li key={q}>{q}</li>)}
                </ul>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden /> সময়
            </h2>
            <p className="mt-2 text-sm text-slate-600">{teacher.available_days?.length ? teacher.available_days.join(", ") : "নমনীয়"}</p>
            <p className="mt-1 text-sm text-slate-600">{teacher.available_time || "নমনীয় সময়"}</p>
            <h2 className="mt-6 text-base font-semibold text-slate-900">আমার সম্পর্কে</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{teacher.bio || "বায়ো দেওয়া হয়নি।"}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>রিভিউ ({reviewData?.total ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {canReview && profile && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-800">এই শিক্ষককে রেট করুন</h3>
              <div className="mt-3">
                <ReviewForm teacherId={teacher.id} />
              </div>
            </div>
          )}
          {reviewData && reviewData.results.length > 0 ? (
            <ReviewList reviews={reviewData.results} />
          ) : (
            <p className="text-sm text-slate-400">এখনো কোনো রিভিউ নেই।</p>
          )}
        </CardContent>
      </Card>

      {similar.length > 0 && (
        <div className="mt-8">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">এই শিক্ষকের মতো আরও</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((t) => (
              <TeacherCard
                key={t.id}
                teacher={t}
                canSave={canInteract}
                initiallySaved={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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
