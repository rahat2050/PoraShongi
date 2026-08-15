import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Inbox, Plus, ScrollText } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { getRoleProfileRow, computeProfileCompletion } from "@/lib/data/profiles";
import { listTuitionsFor } from "@/lib/data/tuitions";
import { listReceivedRequests, loadRequestDisplay } from "@/lib/data/requests";
import { listReceivedContactRequests } from "@/lib/data/contact";
import { getProfilesPublic } from "@/lib/data/profiles-public";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { ProfileCompletion } from "@/components/shared/profile-completion";
import { TuitionStatusBadge } from "@/components/shared/status-badge";
import { RequestRow } from "@/components/shared/request-row";
import { ContactRequestActions } from "@/features/contact/contact-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "শিক্ষক ড্যাশবোর্ড" };

export default async function TeacherDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "teacher") redirect("/dashboard");

  const roleProfileResult = await getRoleProfileRow(profile);
  const completion = computeProfileCompletion(profile, roleProfileResult.data);

  const [tuitions, receivedRequests, contactRequests] = await Promise.all([
    listTuitionsFor(profile.id),
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

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">শিক্ষক ড্যাশবোর্ড</h1>
          <p className="mt-1 text-slate-500">আপনার tuition ও request manage করুন।</p>
        </div>
        <Badge variant="brand">{ROLE_LABELS.teacher.bn} · {ROLE_LABELS.teacher.en}</Badge>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ProfileCompletion percent={completion.percent} missing={completion.missing} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
          <StatCard label="আমার tuition" value={tuitionList.length} icon={<ScrollText className="h-5 w-5" aria-hidden />} href="/dashboard/tuitions" />
          <StatCard label="অপেক্ষমাণ request" value={pendingCount} icon={<Inbox className="h-5 w-5" aria-hidden />} href="/dashboard/requests" />
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Request (যেগুলো এসেছে)</h2>
              <Link href="/dashboard/requests" className="text-sm font-medium text-brand-700 hover:underline">সব দেখুন</Link>
            </div>
            <div className="mt-2 divide-y divide-slate-100">
              {receivedRows.length === 0 ? (
                <EmptyState title="কোনো request নেই" description="শিক্ষার্থীরা request পাঠালে এখানে দেখাবে।" />
              ) : (
                receivedRows.map((row) => <RequestRow key={row.request.id} row={row} direction="received" />)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">আমার tuition</h2>
              <Link href="/dashboard/tuitions/new" className={buttonStyles({ variant: "primary", size: "sm" })}>
                <Plus className="h-4 w-4" aria-hidden /> নতুন tuition
              </Link>
            </div>
            <div className="mt-4 divide-y divide-slate-100">
              {tuitionList.length === 0 ? (
                <EmptyState title="কোনো tuition নেই" description="নিজের tuition listing তৈরি করুন।" />
              ) : (
                tuitionList.slice(0, 4).map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link href={`/dashboard/tuitions/${t.id}`} className="block truncate text-sm font-medium text-slate-800 hover:text-brand-700">{t.title}</Link>
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
    </div>
  );
}
