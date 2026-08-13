import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BellOff } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { listNotifications, getNotificationPreferences } from "@/lib/data/notifications";
import { NotificationItem } from "@/features/notifications/notification-item";
import { MarkAllReadButton } from "@/features/notifications/mark-all-button";
import { PreferencesForm } from "@/features/notifications/preferences-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const [result, prefsResult] = await Promise.all([
    listNotifications(profile.id),
    getNotificationPreferences(profile.id),
  ]);
  const notifications = result.data ?? [];
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-1 text-slate-500">Updates about your tuition journey.</p>
        </div>
        {hasUnread && <MarkAllReadButton />}
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<BellOff className="h-6 w-6" aria-hidden />}
                title="No notifications yet"
                description="Notifications about requests, matches and messages will appear here."
              />
            </div>
          ) : (
            notifications.map((n) => <NotificationItem key={n.id} notification={n} />)
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Notification preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <PreferencesForm prefs={prefsResult.data ?? null} />
        </CardContent>
      </Card>
    </div>
  );
}
