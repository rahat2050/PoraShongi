"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/server-auth";
import { failure, success, type ActionResult } from "@/features/types";

export async function markNotificationRead(notificationId: string): Promise<ActionResult> {
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
