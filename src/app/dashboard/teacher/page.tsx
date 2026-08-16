import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Inbox, ScrollText, Users } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { getRoleProfileRow, computeProfileCompletion } from "@/lib/data/profiles";
import { listAcceptedTuitionsForTeacher } from "@/lib/data/tuitions";
import { listReceivedRequests, loadRequestDisplay } from "@/lib/data/requests";
import { listReceivedContactRequests } from "@/lib/data/contact";
import { getProfilesPublic } from "@/lib/data/profiles-public";
import { listMyStudents } from "@/lib/data/students";
import { getTeacherAnalytics } from "@/lib/data/growth";
import { listTrialRequests } from "@/lib/data/features";
import { ROLE_LABELS } from "@/lib/auth/roles";
import type { TeacherProfile } from "@/types/index";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { ProfileCompletion } from "@/components/shared/profile-completion";
import { TuitionStatusBadge } from "@/components/shared/status-badge";
import { RequestRow } from "@/components/shared/request-row";
import { ContactRequestActions } from "@/features/contact/contact-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { OnboardingChecklist } from "@/components/shared/onboarding-checklist";
import { TrialRequestActions } from "@/features/features-actions-ui2";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "শিক্ষক ড্যাশবোর্ড" };

export default async function TeacherDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "teacher") redirect("/dashboard");

  const roleProfileResult = await getRoleProfileRow(profile);
  const teacherProfile = roleProfileResult.data as TeacherProfile | null;
  const completion = computeProfileCompletion(profile, teacherProfile);
  const isPublicReady = Boolean(
    profile.full_name?.trim() &&
      teacherProfile?.education?.trim() &&
      teacherProfile.subjects?.length &&
      teacherProfile.classes_taught?.length &&
      teacherProfile.teaching_mode &&
      (teacherProfile.teaching_mode === "online" || profile.district?.trim()),
  );

  const [tuitions, receivedRequests, contactRequests] = await Promise.all([
    listAcceptedTuitionsForTeacher(profile.id),
    listReceivedRequests(profile.id),
    listReceivedContactRequests(profile.id),
  ]);

  const tuitionList = tuitions.data ?? [];
  const requestList = receivedRequests.data ?? [];
  const pendingCount = requestList.filter((r) => r.status === "pending").length;
  const receivedRows = await loadRequestDisplay(requestList.slice(0, 5), "received");

  const contactList = contactRequests.data ?? [];
  const contactSenders = (await getProfilesPublic(contactList.map((c) => c.sender_id))).data ?? [];
  const senderMap = new Map(contactSenders.map((p) => [p.id, p]));

  const myStudents = (await listMyStudents(profile.id)).data ?? [];
  const analytics = (await getTeacherAnalytics(profile.id)).data ?? null;

  const trialRequests = (await listTrialRequests(profile.id)).data ?? [];
  const trialSenders = (await getProfilesPublic(trialRequests.map((t) => t.sender_id))).data ?? [];
  const trialSenderMap = new Map(trialSenders.map((p) => [p.id, p]));

  const onboardingSteps = [
    { label: "প্রোফাইল প্রকাশের তথ্য পূরণ করুন", done: isPublicReady, href: "/profile" },
    { label: "প্রথম টিউশন অনুরোধ গ্রহণ করুন", done: tuitionList.length > 0, href: "/dashboard/requests" },
    { label: "প্রথম অনুরোধের উত্তর দিন", done: requestList.length > 0, href: "/dashboard/requests" },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">শিক্ষক ড্যাশবোর্ড</h1>
          <p className="mt-1 text-slate-500">আপনার টিউশন ও অনুরোধ পরিচালনা করুন।</p>
        </div>
        <Badge variant="brand">{ROLE_LABELS.teacher.bn}</Badge>
      </div>

      {!isPublicReady && (
        <Alert variant="warning" title="আপনার প্রোফাইল এখনো প্রকাশিত নয়" className="mt-6">
          শিক্ষা, বিষয়, ক্লাস, পড়ানোর মাধ্যম এবং সরাসরি পড়ালে জেলা পূরণ করুন। তারপর আপনার প্রোফাইল শিক্ষক খোঁজ ও শেয়ার লিংকে দেখা যাবে।{" "}
          <Link href="/profile" className="font-semibold underline">প্রোফাইল সম্পূর্ণ করুন</Link>
        </Alert>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <ProfileCompletion percent={completion.percent} missing={completion.missing} />
          <OnboardingChecklist steps={onboardingSteps} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
          <StatCard label="গৃহীত টিউশন" value={tuitionList.length} icon={<ScrollText className="h-5 w-5" aria-hidden />} href="/dashboard/schedule" />
          <StatCard label="অপেক্ষমাণ অনুরোধ" value={pendingCount} icon={<Inbox className="h-5 w-5" aria-hidden />} href="/dashboard/requests" />
          <StatCard label="প্রোফাইল ভিউ" value={analytics?.profile_views ?? 0} icon={<Users className="h-5 w-5" aria-hidden />} />
        </div>
      </div>

      {analytics && (
        <Card className="mt-6">
          <CardContent className="p-5">
            <h2 className="text-base font-semibold text-slate-900">আপনার পরিসংখ্যান</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-5">
              <div>
                <p className="text-xs text-slate-400">মোট অনুরোধ</p>
                <p className="text-lg font-bold text-slate-800">{analytics.total_requests}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">গ্রহণ</p>
                <p className="text-lg font-bold text-slate-800">{analytics.accepted_requests}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">গ্রহণের হার</p>
                <p className="text-lg font-bold text-slate-800">{analytics.acceptance_rate}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">সেভ করেছেন</p>
                <p className="text-lg font-bold text-slate-800">{analytics.favorites}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">রেটিং</p>
                <p className="text-lg font-bold text-slate-800">
                  {analytics.review_count > 0 ? `★ ${analytics.rating_avg}` : "নতুন"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">প্রাপ্ত অনুরোধ</h2>
              <Link href="/dashboard/requests" className="text-sm font-medium text-brand-700 hover:underline">সব দেখুন</Link>
            </div>
            <div className="mt-2 divide-y divide-slate-100">
              {receivedRows.length === 0 ? (
                <EmptyState title="কোনো অনুরোধ নেই" description="শিক্ষার্থীরা অনুরোধ পাঠালে এখানে দেখাবে।" />
              ) : (
                receivedRows.map((row) => <RequestRow key={row.request.id} row={row} direction="received" />)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">গৃহীত টিউশন</h2>
              <Link href="/tuitions" className={buttonStyles({ variant: "primary", size: "sm" })}>
                <ScrollText className="h-4 w-4" aria-hidden /> টিউশন খুঁজুন
              </Link>
            </div>
            <div className="mt-4 divide-y divide-slate-100">
              {tuitionList.length === 0 ? (
                <EmptyState title="কোনো গৃহীত টিউশন নেই" description="শিক্ষার্থীর অনুরোধ গ্রহণ করলে টিউশন এখানে দেখাবে।" />
              ) : (
                tuitionList.slice(0, 4).map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link href={`/tuitions/${t.id}`} className="block truncate text-sm font-medium text-slate-800 hover:text-brand-700">{t.title}</Link>
                      <p className="text-xs text-slate-400">{t.class_level} · {t.subject}</p>
                    </div>
                    <TuitionStatusBadge status={t.status} />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {contactList.length > 0 && (
        <Card className="mt-6">
          <CardContent className="p-5">
            <h2 className="text-base font-semibold text-slate-900">যোগাযোগ অনুরোধ ({contactList.length})</h2>
            <p className="mt-0.5 text-xs text-slate-400">মঞ্জুর করলে আপনার ফোন নম্বর ওই শিক্ষার্থী দেখতে পাবে।</p>
            <div className="mt-3 divide-y divide-slate-100">
              {contactList.map((c) => {
                const sender = senderMap.get(c.sender_id);
                const senderName = sender?.display_name || sender?.full_name || "শিক্ষার্থী";
                return (
                  <div key={c.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar src={sender?.avatar_url ?? null} name={senderName} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">{senderName}</p>
                        <p className="text-xs text-slate-400">{formatDate(c.created_at)}</p>
                      </div>
                    </div>
                    <ContactRequestActions requestId={c.id} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {trialRequests.length > 0 && (
        <Card className="mt-6">
          <CardContent className="p-5">
            <h2 className="text-base font-semibold text-slate-900">ট্রায়াল ক্লাসের অনুরোধ ({trialRequests.length})</h2>
            <div className="mt-3 divide-y divide-slate-100">
              {trialRequests.map((t) => {
                const sender = trialSenderMap.get(t.sender_id);
                const senderName = sender?.display_name || sender?.full_name || "শিক্ষার্থী";
                return (
                  <div key={t.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{senderName}</p>
                      <p className="truncate text-xs text-slate-400">
                        {t.message || formatDate(t.created_at)}
                      </p>
                    </div>
                    {t.status === "pending" ? (
                      <TrialRequestActions requestId={t.id} />
                    ) : (
                      <Badge variant={t.status === "accepted" ? "success" : "danger"}>{t.status}</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {myStudents.length > 0 && (
        <Card className="mt-6">
          <CardContent className="p-5">
            <h2 className="text-base font-semibold text-slate-900">আমার শিক্ষার্থী ({myStudents.length})</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {myStudents.map((s) => {
                const name = s.display_name || s.full_name || "শিক্ষার্থী";
                return (
                  <div key={s.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                    <Avatar src={s.avatar_url} name={name} size="md" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{name}</p>
                      <p className="truncate text-xs text-slate-400">{[s.area, s.district].filter(Boolean).join(", ") || "এলাকা নেই"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
