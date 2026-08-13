import "server-only";
import { getDb, ok, fail, type DataResult } from "@/lib/data/client";
import { type AppNotification, type NotificationPreferences } from "@/types/index";

export async function listNotifications(
  userId: string,
  limit = 50,
): Promise<DataResult<AppNotification[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return fail(error.message);
  return ok((data ?? []) as AppNotification[]);
}

export async function unreadNotificationCount(
  userId: string,
): Promise<DataResult<number>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { count, error } = await db
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) return fail(error.message);
  return ok(count ?? 0);
}

export async function getNotificationPreferences(
  userId: string,
): Promise<DataResult<NotificationPreferences | null>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return fail(error.message);
  return ok((data as NotificationPreferences | null) ?? null);
}
