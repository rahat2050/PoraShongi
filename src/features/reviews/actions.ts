"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/server-auth";
import { failure, success, type ActionResult } from "@/features/types";

export async function submitReview(input: {
  teacherId: string;
  tuitionId?: string | null;
  rating: number;
  body?: string;
}): Promise<ActionResult> {
  const profile = await requireProfile();
  if (profile.role !== "student" && profile.role !== "guardian") {
    return failure("Only students or guardians can review teachers.");
  }

  const rating = Math.round(input.rating);
  if (rating < 1 || rating > 5) return failure("Rating must be between 1 and 5.");

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").insert({
    teacher_id: input.teacherId,
    reviewer_id: profile.id,
    tuition_id: input.tuitionId ?? null,
    rating,
    body: input.body?.trim() || null,
  });

  if (error) {
    if (error.code === "23505") {
      return failure("You have already reviewed this teacher.");
    }
    if (error.message.includes("accepted tuition interaction")) {
      return failure(
        "You can only review a teacher after an accepted tuition interaction.",
      );
    }
    return failure(error.message);
  }

  revalidatePath(`/teachers/${input.teacherId}`);
  revalidatePath("/dashboard");
  return success();
}

export async function deleteOwnReview(reviewId: string): Promise<ActionResult> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("reviews")
    .select("reviewer_id")
    .eq("id", reviewId)
    .maybeSingle();

  if (!existing || existing.reviewer_id !== profile.id) {
    return failure("You can only delete your own review.");
  }

  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) return failure(error.message);

  revalidatePath("/dashboard");
  return success();
}
