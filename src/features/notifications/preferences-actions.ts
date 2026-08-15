"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/server-auth";
import { failure, success, type ActionResult } from "@/features/types";
import { type NotificationPreferences } from "@/types/index";

export async function updateNotificationPreferences(
  input: Omit<NotificationPreferences, "user_id" | "updated_at">,
): Promise<ActionResult> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase.from("notification_preferences").upsert({
    user_id: profile.id,
    ...input,
  });
  if (error) return failure(error.message);
  revalidatePath("/dashboard/notifications");
  return success();
}

export async function getNotificationPreferencesServer(): Promise<NotificationPreferences | null> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { data } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle();
  return (data as NotificationPreferences | null) ?? null;
}
