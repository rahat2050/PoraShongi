"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/server-auth";
import { failure, success, type ActionResult } from "@/features/types";

export async function toggleBlock(
  otherId: string,
): Promise<ActionResult<{ blocked: boolean }>> {
  const profile = await requireProfile();
  if (otherId === profile.id) return failure("You cannot block yourself.");

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("blocks")
    .select("id")
    .eq("blocker_id", profile.id)
    .eq("blocked_id", otherId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("blocks")
      .delete()
      .eq("id", existing.id);
    if (error) return failure(error.message);
    revalidatePath("/messages");
    return success({ blocked: false });
  }

  const { error } = await supabase.from("blocks").insert({
    blocker_id: profile.id,
    blocked_id: otherId,
  });
  if (error) return failure(error.message);

  revalidatePath("/messages");
  return success({ blocked: true });
}
