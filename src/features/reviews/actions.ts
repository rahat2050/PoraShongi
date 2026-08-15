"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/server-auth";
import { failure, success, type ActionResult } from "@/features/types";
import { type Report } from "@/types/index";

export async function submitReview(input: {
  teacherId: string;
  tuitionId?: string | null;
  rating: number;
  body?: string;
}): Promise<ActionResult> {
  const profile = await requireProfile();
  if (profile.role !== "student" && profile.role !== "guardian") {
    return failure("শুধু শিক্ষার্থী/অভিভাবক রিভিউ দিতে পারবেন।");
  }
  const rating = Math.round(input.rating);
  if (rating < 1 || rating > 5) return failure("রেটিং ১–৫ এর মধ্যে হতে হবে।");

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").insert({
    teacher_id: input.teacherId,
    reviewer_id: profile.id,
    tuition_id: input.tuitionId ?? null,
    rating,
    body: input.body?.trim() || null,
  });

  if (error) {
    if (error.code === "23505") return failure("আপনি আগেই রিভিউ দিয়েছেন।");
    if (error.message.includes("accepted")) return failure("accept হওয়া tuition-এর পরই রিভিউ দেওয়া যাবে।");
    return failure(error.message);
  }

  revalidatePath(`/teachers/${input.teacherId}`);
  revalidatePath("/dashboard");
  return success();
}

export async function submitReport(input: {
  targetType: Report["target_type"];
  targetId: string;
  category: Report["category"];
  details?: string;
}): Promise<ActionResult> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase.from("reports").insert({
    reporter_id: profile.id,
    target_type: input.targetType,
    target_id: input.targetId,
    category: input.category,
    details: input.details?.trim() || null,
  });
  if (error) {
    if (error.code === "23505") return failure("আপনার আগের report এখনো open আছে।");
    return failure(error.message);
  }
  revalidatePath("/dashboard");
  return success();
}

export async function toggleBlock(
  otherId: string,
): Promise<ActionResult<{ blocked: boolean }>> {
  const profile = await requireProfile();
  if (otherId === profile.id) return failure("নিজেকে block করা যাবে না।");

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("blocks")
    .select("id")
    .eq("blocker_id", profile.id)
    .eq("blocked_id", otherId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("blocks").delete().eq("id", existing.id);
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
