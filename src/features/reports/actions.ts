"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/server-auth";
import { failure, success, type ActionResult } from "@/features/types";
import { type Report } from "@/types/index";

export async function submitReport(input: {
  targetType: Report["target_type"];
  targetId: string;
  category: Report["category"];
  details?: string;
}): Promise<ActionResult> {
  const profile = await requireProfile();

  const categories: Report["category"][] = [
    "fake_profile",
    "harassment",
    "inappropriate",
    "scam",
    "spam",
    "safety_concern",
    "other",
  ];
  if (!categories.includes(input.category)) {
    return failure("Please choose a valid report category.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reports").insert({
    reporter_id: profile.id,
    target_type: input.targetType,
    target_id: input.targetId,
    category: input.category,
    details: input.details?.trim() || null,
  });

  if (error) {
    if (error.code === "23505") {
      return failure("You already have an open report for this.");
    }
    return failure(error.message);
  }

  revalidatePath("/dashboard");
  return success();
}
