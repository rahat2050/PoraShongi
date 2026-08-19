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
    new_match: input.new_match,
    new_request: input.new_request,
    request_response: input.request_response,
    new_message: input.new_message,
    upcoming_class: input.upcoming_class,
    schedule_change: input.schedule_change,
    review_received: input.review_received,
    verification_update: input.verification_update,
    email_notify: input.email_notify ?? false,
    updated_at: new Date().toISOString(),
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
