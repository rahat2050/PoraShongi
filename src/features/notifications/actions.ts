"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/server-auth";
import { failure, success, type ActionResult } from "@/features/types";

export async function markNotificationRead(
  notificationId: string,
): Promise<ActionResult> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", profile.id);

  if (error) return failure(error.message);
  revalidatePath("/dashboard/notifications");
  return success();
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", profile.id)
    .eq("read", false);

  if (error) return failure(error.message);
  revalidatePath("/dashboard/notifications");
  return success();
}

export async function updateNotificationPreferences(input: {
  new_match: boolean;
  new_request: boolean;
  request_response: boolean;
  new_message: boolean;
  upcoming_class: boolean;
  schedule_change: boolean;
  review_received: boolean;
  verification_update: boolean;
}): Promise<ActionResult> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { error } = await supabase
    .from("notification_preferences")
    .upsert({
      user_id: profile.id,
      new_match: input.new_match,
      new_request: input.new_request,
      request_response: input.request_response,
      new_message: input.new_message,
      upcoming_class: input.upcoming_class,
      schedule_change: input.schedule_change,
      review_received: input.review_received,
      verification_update: input.verification_update,
    });

  if (error) return failure(error.message);

  revalidatePath("/dashboard/notifications");
  return success();
}
