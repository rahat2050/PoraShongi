import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Briefcase, CalendarDays, GraduationCap, LockKeyhole, MapPin, Star, Wallet } from "lucide-react";
import { getPublicTeacher } from "@/lib/data/teachers";
import { listTuitionsFor } from "@/lib/data/tuitions";
import { isFavorite } from "@/lib/data/favorites";
import { createClient } from "@/lib/supabase/server";
import { getAcceptedTuitionId, getOwnReview, getTeacherReputation, getTeacherReviews, isBlocked } from "@/lib/data/reviews";
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
import { RatingStars } from "@/components/shared/rating-stars";
import { TeacherRatingSummary } from "@/components/shared/teacher-rating-summary";
import { VerificationTierBadge } from "@/components/shared/verification-tier";
import { FastResponse } from "@/components/shared/fast-response";
import { TrialRequestButton } from "@/features/features-actions-ui";
import { recommendTeachers } from "@/lib/data/features";
import { TeacherCard } from "@/components/shared/teacher-card";
import { buttonStyles } from "@/components/ui/button";
import { formatTaka, isUuid, modeLabel } from "@/lib/utils";
import { getSiteUrl } from "@/config/site";

const getTeacher = cache((id: string) => getPublicTeacher(id));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const result = await getTeacher(id);
  const teacher = result.data;

  if (result.error) {
    return {
      title: "শিক্ষকের প্রোফাইল",
      robots: { index: false, follow: false },
    };
  }
  if (!teacher) notFound();

  const name = teacher.display_name || teacher.full_name || "শিক্ষক";
  const subjects = teacher.subjects?.slice(0, 3).join(", ") || "টিউশন";
  const location = [teacher.area, teacher.district].filter(Boolean).join(", ");
  const description = location
    ? `${name}—${subjects} বিষয়ে ${location} এলাকার শিক্ষক। যোগ্যতা, অভিজ্ঞতা, ফি ও রিভিউ দেখুন।`
    : `${name}—${subjects} বিষয়ের শিক্ষক। যোগ্যতা, অভিজ্ঞতা, ফি ও রিভিউ দেখুন।`;
  const canonicalPath = `/teachers/${teacher.id}`;
  const image = teacher.avatar_url || "/icon-512.png";

  return {
    title: `${name} — ${subjects} শিক্ষক`,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "profile",
      url: canonicalPath,
      siteName: "PoraSathi",
      locale: "bn_BD",
      title: `${name} — PoraSathi শিক্ষক`,
      description,
      images: [{ url: image, alt: `${name}-এর প্রোফাইল ছবি` }],
    },
    twitter: {
      card: "summary",
      title: `${name} — PoraSathi শিক্ষক`,
      description,
      images: [image],
    },
  };
}

export default async function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  if (!isSupabaseConfigured()) return <SetupRequired />;

  const result = await getTeacher(id);
  const teacher = result.data ?? null;
  if (!teacher) notFound();

  const name = teacher.display_name || teacher.full_name || "শিক্ষক";
  const teacherLocation = [teacher.area, teacher.district].filter(Boolean).join(", ")
    || (teacher.teaching_mode === "online" || teacher.teaching_mode === "both" ? "অনলাইন" : "এলাকা দেওয়া হয়নি");

  const user = await getCurrentUser();
  const profile = user ? await getCurrentProfile() : null;
  const canInteract = profile?.role === "student" || profile?.role === "guardian";

  const openTuitions = canInteract && profile
    ? ((await listTuitionsFor(profile.id)).data ?? []).filter((t) => t.status === "open")
    : [];

  const [savedRes, reputation, reviews, ownReviewRes, acceptedTuitionRes, blockedRes, contactRes] = await Promise.all([
    canInteract && profile ? isFavorite(profile.id, teacher.id) : Promise.resolve({ data: false, error: null }),
    getTeacherReputation(teacher.id),
    getTeacherReviews(teacher.id, 1, 50),
    canInteract && profile ? getOwnReview(profile.id, teacher.id) : Promise.resolve({ data: null, error: null }),
    canInteract && profile ? getAcceptedTuitionId(profile.id, teacher.id) : Promise.resolve({ data: null, error: null }),
    canInteract && profile ? isBlocked(profile.id, teacher.id) : Promise.resolve({ data: false, error: null }),
    canInteract && profile ? getContactStatus(profile.id, teacher.id) : Promise.resolve({ data: null, error: null }),
  ]);

  const saved = savedRes.data ?? false;
  const reviewData = reviews.data;
  const publishedReviews = reviewData?.results ?? [];
  const ownReview = ownReviewRes.data ?? null;
  const canRate = Boolean(acceptedTuitionRes.data) && (!ownReview || ownReview.status === "published");
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
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url: `${getSiteUrl()}/teachers/${teacher.id}`,
    ...(teacher.avatar_url ? { image: teacher.avatar_url } : {}),
    jobTitle: "শিক্ষক",
    knowsAbout: teacher.subjects ?? [],
    ...(teacher.district
      ? { address: { "@type": "PostalAddress", addressRegion: teacher.district, addressCountry: "BD" } }
      : {}),
    ...(teacher.review_count && teacher.review_count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: teacher.rating_avg,
            ratingCount: teacher.review_count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
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
              <p className="mt-1 text-slate-600">{teacher.headline || "টিউশন শিক্ষক"}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {(teacher.review_count ?? 0) > 0 ? (
                  <>
                    <RatingStars rating={teacher.rating_avg ?? 0} size="sm" />
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{teacher.rating_avg ?? 0}/৫</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">· {teacher.review_count ?? 0} রিভিউ</span>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <Star className="h-4 w-4 text-slate-300 dark:text-slate-600" aria-hidden /> এখনো রেটিং নেই
                  </span>
                )}
              </div>
              {reputation.data && (
                <div className="mt-1 space-y-0.5">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {reputation.data.completed_tuitions}টি টিউশন সম্পন্ন
                    {reputation.data.response_count > 0
                      ? ` · ${reputation.data.response_count}টি উত্তরযোগ্য অনুরোধে সাড়া ${reputation.data.response_rate}%`
                      : ""}
                  </p>
                  {reputation.data.response_count > 0 && <FastResponse avgHours={reputation.data.avg_response_hours} />}
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
                <Detail icon={<MapPin className="h-4 w-4" />} label="এলাকা" value={teacherLocation} />
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
              <p className="text-sm text-slate-500">শিক্ষক অ্যাকাউন্ট থেকে টিউশনের অনুরোধ পাঠানো যায় না।</p>
            ) : (
              <Link href={`/login?next=/teachers/${teacher.id}`} className={buttonStyles()}>
                অনুরোধ পাঠাতে লগইন করুন
              </Link>
            )}
          </div>

          {teacherPhone && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              📞 যোগাযোগ: <span className="font-semibold">{teacherPhone}</span>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
            <p className="text-xs text-slate-400">প্রোফাইল শেয়ার করুন:</p>
            <ShareButtons
              url={`${getSiteUrl()}/teachers/${teacher.id}`}
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
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{teacher.bio || "নিজের সম্পর্কে কোনো তথ্য দেওয়া হয়নি।"}</p>
            {teacher.teaching_style && (
              <>
                <h2 className="mt-6 text-base font-semibold text-slate-900">পড়ানোর ধরণ</h2>
                <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{teacher.teaching_style}</p>
              </>
            )}
            {teacher.languages && teacher.languages.length > 0 && (
              <>
                <h2 className="mt-6 text-base font-semibold text-slate-900">ভাষা</h2>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {teacher.languages.map((l) => <Badge key={l} variant="outline">{l}</Badge>)}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card id="ratings" className="mt-6 scroll-mt-24 overflow-hidden">
        <CardHeader className="bg-slate-50/80 dark:bg-slate-900/50">
          <CardTitle>শিক্ষক রেটিং ও রিভিউ</CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-300">শুধু গৃহীত টিউশন অভিজ্ঞতা থেকে ১–৫ স্টার রেটিং প্রকাশ করা যায়।</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <TeacherRatingSummary
            average={reputation.data?.rating_avg ?? teacher.rating_avg ?? 0}
            total={reviewData?.total ?? teacher.review_count ?? 0}
            reviews={publishedReviews}
          />

          {canRate && profile && (
            <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4 sm:p-5 dark:border-brand-800 dark:bg-brand-950/30">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{ownReview ? "আপনার রেটিং সম্পাদনা করুন" : "এই শিক্ষককে রেট করুন"}</h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">আপনার সৎ অভিজ্ঞতা অন্য শিক্ষার্থী ও অভিভাবককে সিদ্ধান্ত নিতে সাহায্য করবে।</p>
              <div className="mt-4">
                <ReviewForm teacherId={teacher.id} existingReview={ownReview} />
              </div>
            </div>
          )}

          {!profile && (
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-900/60">
              <p className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden /> গৃহীত টিউশন থাকলে লগইন করে এই শিক্ষককে রেট করতে পারবেন।
              </p>
              <Link href={`/login?next=${encodeURIComponent(`/teachers/${teacher.id}#ratings`)}`} className={buttonStyles({ variant: "outline", size: "sm" })}>লগইন করুন</Link>
            </div>
          )}

          {profile && !canInteract && (
            <p className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden /> শুধু শিক্ষার্থী বা অভিভাবক তাদের গৃহীত টিউশন অভিজ্ঞতা রেট করতে পারেন।
            </p>
          )}

          {canInteract && profile && !acceptedTuitionRes.data && !ownReview && (
            <p className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden /> এই শিক্ষকের সঙ্গে আপনার কোনো গৃহীত টিউশন নেই। অনুরোধ গ্রহণ হলে রেটিং দিতে পারবেন।
            </p>
          )}

          {ownReview && ownReview.status !== "published" && (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">আপনার আগের রিভিউটি বর্তমানে মডারেশনে আছে।</p>
          )}

          {reviews.error ? (
            <p className="text-sm text-red-600 dark:text-red-400">রিভিউ লোড করা যায়নি।</p>
          ) : publishedReviews.length > 0 ? (
            <div>
              <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-100">প্রকাশিত অভিজ্ঞতা</h3>
              <ReviewList reviews={publishedReviews} />
            </div>
          ) : null}
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
    <div>
      <dt className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span aria-hidden>{icon}</span>
        {label}
      </dt>
      <dd className="ml-6 text-slate-700 dark:text-slate-200">{value}</dd>
    </div>
  );
}
