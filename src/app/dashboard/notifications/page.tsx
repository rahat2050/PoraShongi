import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BellOff } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { listNotifications } from "@/lib/data/notifications";
import { getNotificationPreferencesServer } from "@/features/notifications/preferences-actions";
import { NotificationTabs } from "@/features/notifications/notification-tabs";
import { MarkAllReadButton } from "@/features/notifications/mark-all-button";
import { PreferencesForm } from "@/features/notifications/preferences-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "নোটিফিকেশন" };

export default async function NotificationsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const [result, prefs] = await Promise.all([
    listNotifications(profile.id),
    getNotificationPreferencesServer(),
  ]);
  const notifications = result.data ?? [];
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">নোটিফিকেশন</h1>
          <p className="mt-1 text-slate-500">request, match ও আপডেটের খবর।</p>
        </div>
        {hasUnread && <MarkAllReadButton />}
      </div>

      <Card className="mt-6">
        <CardContent className="p-4">
          {notifications.length === 0 ? (
            <div className="p-2">
              <EmptyState icon={<BellOff className="h-6 w-6" aria-hidden />} title="কোনো নোটিফিকেশন নেই" description="নতুন নোটিফিকেশন এলে এখানে দেখাবে।" />
            </div>
          ) : (
            <NotificationTabs notifications={notifications} />
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle>নোটিফিকেশন পছন্দ</CardTitle></CardHeader>
        <CardContent><PreferencesForm prefs={prefs} /></CardContent>
      </Card>
    </div>
  );
}
