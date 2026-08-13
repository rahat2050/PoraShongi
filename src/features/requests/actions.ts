"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/server-auth";
import { sendRequestSchema } from "@/validation/tuition";
import { failure, success, type ActionResult } from "@/features/types";
import { type RequestStatus } from "@/types/index";

export async function sendTuitionRequest(input: {
  tuitionId: string;
  teacherId: string;
  message?: string;
}): Promise<ActionResult<{ id: string }>> {
  const profile = await requireProfile();

  if (profile.role !== "student" && profile.role !== "guardian") {
    return failure("Only students or guardians can send tuition requests.");
  }

  const parsed = sendRequestSchema.safeParse(input);
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Invalid input.");
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
      tuition_id: parsed.data.tuitionId,
      sender_id: profile.id,
      teacher_id: parsed.data.teacherId,
      student_id: studentId,
      message: parsed.data.message || null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505" || error.message.includes("duplicate")) {
      return failure(
        "You already have an active request for this tuition with this teacher.",
      );
    }
    return failure(error.message);
  }

  revalidatePath("/dashboard/requests");
  revalidatePath(`/teachers/${parsed.data.teacherId}`);
  return success({ id: data.id });
}

export async function respondToRequest(
  requestId: string,
  decision: "accepted" | "rejected",
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (profile.role !== "teacher") {
    return failure("Only teachers can respond to requests.");
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("tuition_requests")
    .select("teacher_id,status")
    .eq("id", requestId)
    .maybeSingle();

  if (!existing || existing.teacher_id !== profile.id) {
    return failure("You can only respond to requests sent to you.");
  }
  if (existing.status !== "pending") {
    return failure("This request has already been answered.");
  }

  const status: RequestStatus = decision;
  const { error } = await supabase
    .from("tuition_requests")
    .update({ status })
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

  const isInvolved =
    existing?.sender_id === profile.id ||
    (existing?.student_id != null && existing.student_id === profile.id);

  if (!existing || !isInvolved) {
    return failure("You can only withdraw your own requests.");
  }
  if (existing.status !== "pending") {
    return failure("This request can no longer be withdrawn.");
  }

  const { error } = await supabase
    .from("tuition_requests")
    .update({ status: "withdrawn" })
    .eq("id", requestId);

  if (error) return failure(error.message);

  revalidatePath("/dashboard/requests");
  return success();
}
