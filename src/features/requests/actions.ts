"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/server-auth";
import { failure, success, type ActionResult } from "@/features/types";

export async function sendTuitionRequest(input: {
  tuitionId: string;
  teacherId: string;
  message?: string;
}): Promise<ActionResult<{ id: string }>> {
  const profile = await requireProfile();
  if (profile.role !== "student" && profile.role !== "guardian") {
    return failure("শুধু শিক্ষার্থী বা অভিভাবক request পাঠাতে পারবেন।");
  }

  let studentId: string | null = profile.role === "student" ? profile.id : null;
  if (profile.role === "guardian") {
    const supabase = await createClient();
    const { data: gp } = await supabase
      .from("guardian_profiles")
      .select("linked_student_id")
      .eq("id", profile.id)
      .maybeSingle();
    studentId = (gp?.linked_student_id as string | null) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tuition_requests")
    .insert({
      tuition_id: input.tuitionId,
      sender_id: profile.id,
      teacher_id: input.teacherId,
      student_id: studentId,
      message: input.message?.trim() || null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505" || error.message.includes("duplicate")) {
      return failure("আপনি ইতিমধ্যে এই teacher-কে request পাঠিয়েছেন।");
    }
    return failure(error.message);
  }

  revalidatePath("/dashboard/requests");
  revalidatePath(`/teachers/${input.teacherId}`);
  return success({ id: data.id });
}

export async function respondToRequest(
  requestId: string,
  decision: "accepted" | "rejected",
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (profile.role !== "teacher") return failure("শুধু শিক্ষক respond করতে পারবেন।");

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("tuition_requests")
    .select("teacher_id,status")
    .eq("id", requestId)
    .maybeSingle();

  if (!existing || existing.teacher_id !== profile.id) {
    return failure("শুধু নিজের request respond করতে পারবেন।");
  }
  if (existing.status !== "pending") return failure("এই request ইতিমধ্যে উত্তর দেওয়া হয়েছে।");

  const { error } = await supabase
    .from("tuition_requests")
    .update({ status: decision })
    .eq("id", requestId);

  if (error) return failure(error.message);

  revalidatePath("/dashboard/requests");
  revalidatePath("/dashboard");
  return success();
}

export async function withdrawRequest(requestId: string): Promise<ActionResult> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("tuition_requests")
    .select("sender_id,student_id,status")
    .eq("id", requestId)
    .maybeSingle();

  const involved =
    existing?.sender_id === profile.id ||
    (existing?.student_id != null && existing.student_id === profile.id);

  if (!existing || !involved) return failure("শুধু নিজের request withdraw করতে পারবেন।");
  if (existing.status !== "pending") return failure("এই request আর withdraw করা যাবে না।");

  const { error } = await supabase
    .from("tuition_requests")
    .update({ status: "withdrawn" })
    .eq("id", requestId);

  if (error) return failure(error.message);

  revalidatePath("/dashboard/requests");
  return success();
}
