"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/server-auth";
import { failure, success, type ActionResult } from "@/features/types";
import { type Report } from "@/types/index";

/**
 * ভিডিও টেস্টিমোনিয়ালের লিংক। DB constraint-এর (migration 0036) সাথে একই
 * allowlist — youtube.com / youtu.be / vimeo.com, অবশ্যই https।
 * অন্য যেকোনো লিংক এখানেই আটকায়, ফলে থার্ড-পার্টি embed ঢুকতে পারে না।
 */
const videoUrlSchema = z
  .string()
  .trim()
  .url("সঠিক লিংক দিন (https:// দিয়ে শুরু)।")
  .max(300, "লিংকটি অনেক লম্বা।")
  .refine(
    (value) =>
      /^https:\/\/((www|m)\.)?(youtube\.com\/(watch\?\S+|shorts\/[A-Za-z0-9_-]{6,}|embed\/[A-Za-z0-9_-]{6,})|youtu\.be\/[A-Za-z0-9_-]{6,}|vimeo\.com\/[0-9]{4,})/.test(
        value,
      ),
    "শুধু YouTube বা Vimeo লিংক দেওয়া যাবে।",
  );

const reviewInputSchema = z.object({
  teacherId: z.string().uuid("শিক্ষকের পরিচয় সঠিক নয়।"),
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().max(2000, "রিভিউ সর্বোচ্চ ২০০০ অক্ষরের হতে পারে।").optional(),
  videoUrl: videoUrlSchema.optional(),
});

export async function submitReview(input: {
  teacherId: string;
  rating: number;
  body?: string;
  videoUrl?: string;
}): Promise<ActionResult<{ updated: boolean }>> {
  const profile = await requireProfile();
  if (profile.role !== "student" && profile.role !== "guardian") {
    return failure("শুধু শিক্ষার্থী বা অভিভাবক রেটিং দিতে পারবেন।");
  }

  const parsed = reviewInputSchema.safeParse({ ...input, rating: Math.round(input.rating) });
  if (!parsed.success) return failure(parsed.error.issues[0]?.message ?? "রেটিং সঠিক নয়।");

  const supabase = await createClient();
  const { data: interaction, error: interactionError } = await supabase
    .from("tuition_requests")
    .select("tuition_id")
    .eq("teacher_id", parsed.data.teacherId)
    .eq("status", "accepted")
    .or(`sender_id.eq.${profile.id},student_id.eq.${profile.id}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (interactionError) return failure(interactionError.message);
  if (!interaction) return failure("শিক্ষকের সঙ্গে গৃহীত টিউশন থাকলেই রেটিং দেওয়া যাবে।");

  const { data: existing, error: existingError } = await supabase
    .from("reviews")
    .select("id,status")
    .eq("reviewer_id", profile.id)
    .eq("teacher_id", parsed.data.teacherId)
    .maybeSingle();
  if (existingError) return failure(existingError.message);
  if (existing && existing.status !== "published") {
    return failure("এই রিভিউটি মডারেশনে আছে, তাই এখন সম্পাদনা করা যাবে না।");
  }

  const reviewValues = {
    tuition_id: interaction.tuition_id,
    rating: parsed.data.rating,
    body: parsed.data.body || null,
    video_url: parsed.data.videoUrl || null,
  };
  const { error } = existing
    ? await supabase
        .from("reviews")
        .update({ ...reviewValues, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .eq("reviewer_id", profile.id)
    : await supabase.from("reviews").insert({
        teacher_id: parsed.data.teacherId,
        reviewer_id: profile.id,
        ...reviewValues,
      });

  if (error) {
    if (error.code === "23505") return failure("আপনি আগেই রেটিং দিয়েছেন—পেজ রিফ্রেশ করে সম্পাদনা করুন।");
    if (error.message.toLowerCase().includes("accepted")) return failure("গৃহীত টিউশনের পরই রেটিং দেওয়া যাবে।");
    return failure(error.message);
  }

  revalidatePath(`/teachers/${parsed.data.teacherId}`);
  revalidatePath("/teachers");
  revalidatePath("/leaderboard");
  revalidatePath("/");
  revalidatePath("/dashboard");
  return success({ updated: Boolean(existing) });
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
