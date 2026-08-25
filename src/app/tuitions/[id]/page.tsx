import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MapPin, Sparkles, User, Users, Wallet } from "lucide-react";
import { getPublicTuition, getPublicTuitionTeaser, hasAcceptedTuitionForTeacher } from "@/lib/data/tuitions";
import { matchTeachersForTuition } from "@/lib/data/teachers";
import { getCurrentUser, getCurrentProfile } from "@/lib/auth/server-auth";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupRequired } from "@/components/shared/setup-required";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { TuitionStatusBadge } from "@/components/shared/status-badge";
import { MatchBadge } from "@/components/shared/match-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ShareButtons } from "@/components/shared/share-buttons";
import { Reveal } from "@/components/motion/reveal";
import { MeetingLinkForm } from "@/features/tuitions/meeting-link-form";
import { SaveTuitionButton } from "@/components/shared/save-tuition-button";
import { isTuitionSaved } from "@/lib/data/saved-tuitions";
import { JoinBatchButton } from "@/features/features-actions-ui";
import { isBatchMember } from "@/lib/data/features";
import { buttonStyles } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { formatDate, formatTaka, isUuid, modeLabel } from "@/lib/utils";
import { getSiteUrl } from "@/config/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isUuid(id) || !isSupabaseConfigured()) {
    return { title: "টিউশন বিস্তারিত", robots: { index: false, follow: true } };
  }

  const teaser = (await getPublicTuitionTeaser(id)).data;
  if (!teaser) {
    // Closed/assigned tuitions stay reachable for signed-in participants but
    // must never be indexed as live opportunities.
    return { title: "টিউশন বিস্তারিত", robots: { index: false, follow: true } };
  }

  const place = [teaser.area, teaser.district].filter(Boolean).join(", ");
  return buildPageMetadata({
    title: `${teaser.title} — ${teaser.subject}, ${teaser.class_level}${place ? ` · ${place}` : ""}`,
    description: `${teaser.class_level} ${teaser.subject} টিউশন${place ? ` (${place})` : ""} · ${modeLabel(teaser.teaching_mode)} · ${formatTaka(teaser.budget)}। PoraSathi-তে আবেদন করুন।`,
    path: `/tuitions/${id}`,
  });
}

export default async function TuitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  if (!isSupabaseConfigured()) return <SetupRequired />;

  const user = await getCurrentUser();
  if (!user) {
    // Anonymous visitors get an indexable teaser: enough to judge the
    // opportunity, but no poster identity, requirements or meeting link.
    const teaser = (await getPublicTuitionTeaser(id)).data;
    if (!teaser) notFound();
    return <PublicTuitionTeaser tuition={teaser} />;
  }

  const result = await getPublicTuition(id);
  const tuition = result.data ?? null;
  if (!tuition) notFound();

  const profile = await getCurrentProfile();
  const isOwner = profile?.id === tuition.poster_id;
  const isTuitionStudent = profile?.id === tuition.student_id;
  const isAcceptedTeacher = profile?.role === "teacher"
    ? (await hasAcceptedTuitionForTeacher(tuition.id, profile.id)).data ?? false
    : false;
  const canManageMeeting = isOwner || isAcceptedTeacher || profile?.role === "admin";
  const canViewMeeting = canManageMeeting || isTuitionStudent;
  const tuitionSaved = profile?.role === "teacher"
    ? (await isTuitionSaved(profile.id, tuition.id)).data ?? false
    : false;
  const batchJoined = profile?.role === "student" && tuition.is_batch
    ? (await isBatchMember(tuition.id, profile.id)).data ?? false
    : false;

  let matches: { total: number; results: import("@/types/index").TeacherMatch[] } | null = null;
  if (isOwner && profile) {
    const m = await matchTeachersForTuition(tuition.id, 6);
    if (m.data) matches = m.data;
  }

  const posterName = tuition.poster_display_name || tuition.poster_name || "সদস্য";
  const location = [tuition.area, tuition.district].filter(Boolean).join(", ");

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <Reveal>
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{tuition.title}</h1>
            <TuitionStatusBadge status={tuition.status} />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge variant="brand">{tuition.class_level}</Badge>
            <Badge variant="accent">{tuition.subject}</Badge>
            <Badge variant="outline">{modeLabel(tuition.teaching_mode)}</Badge>
          </div>

          <dl className="mt-6 space-y-3 text-sm text-slate-700">
            {location && <Row icon={<MapPin className="h-4 w-4" />} label="এলাকা" value={location} />}
            <Row icon={<Wallet className="h-4 w-4" />} label="বাজেট" value={`${formatTaka(tuition.budget)}${tuition.budget_negotiable ? " (আলোচনা সাপেক্ষ)" : ""}`} />
            <Row icon={<CalendarDays className="h-4 w-4" />} label="দিন" value={tuition.preferred_days?.length ? tuition.preferred_days.join(", ") : "নমনীয়"} />
            <Row icon={<Clock className="h-4 w-4" />} label="সময়" value={tuition.preferred_time || "নমনীয়"} />
            {tuition.is_batch && (
              <Row
                icon={<Users className="h-4 w-4" />}
                label="Batch সিট"
                value={tuition.batch_size ? `${tuition.seats_filled ?? 0}/${tuition.batch_size} ভর্তি` : `${tuition.seats_filled ?? 0} জন ভর্তি`}
              />
            )}
          </dl>

          {tuition.requirements && (
            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <h2 className="text-sm font-semibold text-slate-800">চাহিদা / শর্তাবলি</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{tuition.requirements}</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
            <div className="flex items-center gap-3">
              <Avatar src={tuition.poster_avatar} name={posterName} size="sm" />
              <div>
                <p className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                  <User className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                  {posterName}
                </p>
                <p className="text-xs text-slate-400">{formatDate(tuition.created_at)}</p>
              </div>
            </div>
            {isOwner && (
              <Link href={`/dashboard/tuitions/${tuition.id}`} className={buttonStyles({ variant: "outline", size: "sm" })}>
                পরিচালনা করুন
              </Link>
            )}
            {profile?.role === "teacher" && !isOwner && (
              <SaveTuitionButton tuitionId={tuition.id} initiallySaved={tuitionSaved} />
            )}
            {profile?.role === "student" && tuition.is_batch && !isOwner && (
              <JoinBatchButton
                tuitionId={tuition.id}
                seatsLeft={tuition.batch_size ? (tuition.batch_size - (tuition.seats_filled ?? 0)) : 0}
                initiallyJoined={batchJoined}
              />
            )}
          </div>

          {canManageMeeting && (
            <MeetingLinkForm tuitionId={tuition.id} initialLink={tuition.meeting_link ?? null} />
          )}

          {canViewMeeting && !canManageMeeting && tuition.meeting_link && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-800">🎥 অনলাইন ক্লাস</p>
              <p className="mt-1 text-xs text-emerald-700">শিক্ষক মিটিং লিংক দিয়েছেন — ক্লাসের সময় join করুন।</p>
              <a
                href={tuition.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonStyles({ className: "mt-3 bg-emerald-700 hover:bg-emerald-800" })}
              >
                Join Class →
              </a>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
            <p className="text-xs text-slate-400">শেয়ার করুন:</p>
            <ShareButtons
              url={`${getSiteUrl()}/tuitions/${tuition.id}`}
              title={`${tuition.title} — PoraSathi`}
            />
          </div>
        </CardContent>
      </Card>
      </Reveal>

      {isOwner && matches && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-600" aria-hidden />
              ম্যাচ হওয়া শিক্ষক ({matches.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {matches.results.length === 0 ? (
              <EmptyState title="এখনই কোনো উপযুক্ত শিক্ষক নেই" description="নতুন শিক্ষক যুক্ত হলে খুঁজে নিন।" />
            ) : (
              <div className="space-y-3">
                {matches.results.map((m, index) => {
                  const name = m.display_name || m.full_name || "শিক্ষক";
                  return (
                    <Reveal key={m.id} delay={Math.min(index * 60, 300)} direction="left">
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                      <Avatar src={m.avatar_url} name={name} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{name}</p>
                        <p className="truncate text-xs text-slate-500">{m.subjects?.slice(0, 3).join(", ") || m.headline || "শিক্ষক"}</p>
                      </div>
                      <MatchBadge score={m.score} />
                      <Link href={`/teachers/${m.id}`} className="text-sm font-medium text-brand-700 hover:underline">দেখুন</Link>
                    </div>
                    </Reveal>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-slate-400">{icon}</span>
      <span className="w-32 shrink-0 text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}

/**
 * Anonymous view of an open tuition.
 *
 * ইচ্ছাকৃতভাবে যা নেই: পোস্টদাতার নাম/ছবি, requirements (মুক্ত টেক্সটে ফোন বা
 * ঠিকানা থাকতে পারে), meeting link, ব্যাচ যোগদান। এগুলো লগইনের পরে।
 */
function PublicTuitionTeaser({ tuition }: { tuition: import("@/types/index").TuitionTeaser }) {
  const location = [tuition.area, tuition.district].filter(Boolean).join(", ");
  const loginHref = `/login?next=${encodeURIComponent(`/tuitions/${tuition.id}`)}`;

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { name: "হোম", path: "/" },
          { name: "টিউশন", path: "/tuitions" },
          { name: tuition.title },
        ]}
      />

      <Reveal>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <TuitionStatusBadge status={tuition.status} />
              {tuition.is_featured && (
                <Badge variant="accent">
                  <Sparkles className="h-3 w-3" aria-hidden /> Featured
                </Badge>
              )}
              {tuition.is_batch && (
                <Badge variant="info">
                  <Users className="h-3 w-3" aria-hidden /> ব্যাচ
                  {tuition.batch_size ? ` · ${tuition.seats_filled}/${tuition.batch_size}` : ""}
                </Badge>
              )}
            </div>

            <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{tuition.title}</h1>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge variant="brand">{tuition.class_level}</Badge>
              <Badge variant="accent">{tuition.subject}</Badge>
              <Badge variant="outline">{modeLabel(tuition.teaching_mode)}</Badge>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              {location && <Row icon={<MapPin className="h-4 w-4" aria-hidden />} label="এলাকা" value={location} />}
              <Row
                icon={<Wallet className="h-4 w-4" aria-hidden />}
                label="বাজেট"
                value={`${formatTaka(tuition.budget)}${tuition.budget_negotiable ? " (আলোচনা সাপেক্ষ)" : ""}`}
              />
              <Row
                icon={<CalendarDays className="h-4 w-4" aria-hidden />}
                label="দিন"
                value={tuition.preferred_days?.length ? tuition.preferred_days.join(", ") : "যেকোনো দিন"}
              />
              <Row
                icon={<Clock className="h-4 w-4" aria-hidden />}
                label="সময়"
                value={tuition.preferred_time || "যেকোনো সময়"}
              />
              <Row
                icon={<User className="h-4 w-4" aria-hidden />}
                label="পোস্ট হয়েছে"
                value={formatDate(tuition.created_at)}
              />
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50 p-6 dark:border-brand-800 dark:bg-brand-950/40">
        <h2 className="text-lg font-bold text-brand-950 dark:text-brand-100">এই টিউশনে আবেদন করতে চান?</h2>
        <p className="mt-2 text-sm leading-7 text-brand-900 dark:text-brand-200">
          পোস্টদাতার বিস্তারিত চাহিদা দেখতে ও আবেদন পাঠাতে শিক্ষক হিসেবে লগইন করুন। অ্যাকাউন্ট খোলা সম্পূর্ণ ফ্রি।
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={loginHref} className={buttonStyles()}>লগইন করে আবেদন করুন</Link>
          <Link href="/register" className={buttonStyles({ variant: "outline" })}>শিক্ষক হিসেবে রেজিস্টার</Link>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link href="/tuitions" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300">
          ← সব খোলা টিউশন দেখুন
        </Link>
      </div>
    </div>
  );
}
