"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/server-auth";
import { failure, success, type ActionResult } from "@/features/types";

export async function createSession(input: {
  tuitionId: string;
  scheduledAt: string;
  notes?: string;
}): Promise<ActionResult> {
  const profile = await requireProfile();
  if (profile.role !== "teacher") return failure("শুধু শিক্ষক ক্লাস schedule করতে পারবেন।");

  const supabase = await createClient();
  const { data: tuition } = await supabase
    .from("tuitions")
    .select("student_id")
    .eq("id", input.tuitionId)
    .maybeSingle();
  if (!tuition) return failure("Tuition পাওয়া যায়নি।");

  const { error } = await supabase.from("sessions").insert({
    tuition_id: input.tuitionId,
    teacher_id: profile.id,
    student_id: tuition.student_id ?? null,
    scheduled_at: new Date(input.scheduledAt).toISOString(),
    notes: input.notes || null,
  });

  if (error) return failure(error.message);
  revalidatePath("/dashboard/schedule");
  return success();
}

export async function setSessionStatus(
  sessionId: string,
  status: "scheduled" | "completed" | "cancelled" | "rescheduled",
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (profile.role !== "teacher") return failure("শুধু শিক্ষক।");
  const supabase = await createClient();
  const { error } = await supabase
    .from("sessions")
    .update({ status })
    .eq("id", sessionId)
    .eq("teacher_id", profile.id);
  if (error) return failure(error.message);
  revalidatePath("/dashboard/schedule");
  return success();
}

export async function setAttendance(
  sessionId: string,
  attendance: "present" | "absent",
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (profile.role !== "teacher") return failure("শুধু শিক্ষক।");
  const supabase = await createClient();
  const { error } = await supabase
    .from("sessions")
    .update({ attendance, status: "completed" })
    .eq("id", sessionId)
    .eq("teacher_id", profile.id);
  if (error) return failure(error.message);
  revalidatePath("/dashboard/schedule");
  return success();
}

export async function deleteSession(sessionId: string): Promise<ActionResult> {
  const profile = await requireProfile();
  if (profile.role !== "teacher") return failure("শুধু শিক্ষক।");
  const supabase = await createClient();
  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId)
    .eq("teacher_id", profile.id);
  if (error) return failure(error.message);
  revalidatePath("/dashboard/schedule");
  return success();
}
