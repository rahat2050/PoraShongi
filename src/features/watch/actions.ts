"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/server-auth";
import { failure, success, type ActionResult } from "@/features/types";

export async function createWatch(input: {
  tuitionId?: string | null;
  classLevel?: string;
  subject?: string;
  location?: string;
  teachingMode?: string;
  budget?: number | null;
}): Promise<ActionResult<{ id: string }>> {
  const profile = await requireProfile();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("watch_requests")
    .insert({
      user_id: profile.id,
      tuition_id: input.tuitionId ?? null,
      class_level: input.classLevel || null,
      subject: input.subject || null,
      location: input.location || null,
      teaching_mode: input.teachingMode || null,
      budget: input.budget ?? null,
    })
    .select("id")
    .single();

  if (error) return failure(error.message);

  revalidatePath("/dashboard");
  return success({ id: data.id });
}

export async function deleteWatch(watchId: string): Promise<ActionResult> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("watch_requests")
    .select("user_id")
    .eq("id", watchId)
    .maybeSingle();

  if (!existing || existing.user_id !== profile.id) {
    return failure("You can only remove your own alerts.");
  }

  const { error } = await supabase
    .from("watch_requests")
    .delete()
    .eq("id", watchId);
  if (error) return failure(error.message);

  revalidatePath("/dashboard");
  return success();
}
