"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/server-auth";
import { failure, success, type ActionResult } from "@/features/types";

export interface SessionInput {
  tuitionId: string;
  scheduledAt: string; // ISO
  endAt?: string;
  notes?: string;
  studentId?: string | null;
}

async function assertTeacherCanManageTuition(
  teacherId: string,
  tuitionId: string,
): Promise<string | null> {
  const supabase = await createClient();

  const { data: tuition } = await supabase
    .from("tuitions")
    .select("poster_id,student_id")
    .eq("id", tuitionId)
    .maybeSingle();

  if (!tuition) return "Tuition not found.";

  if (tuition.poster_id === teacherId) return null;

  const { data: accepted } = await supabase
    .from("tuition_requests")
    .select("id")
    .eq("tuition_id", tuitionId)
    .eq("teacher_id", teacherId)
    .eq("status", "accepted")
    .maybeSingle();

  if (!accepted) return "You can only schedule for tuitions you are assigned to.";

  return null;
}

export async function createSession(
  input: SessionInput,
): Promise<ActionResult<{ id: string }>> {
  const profile = await requireProfile();
  if (profile.role !== "teacher") return failure("Only teachers can schedule classes.");

  if (!input.scheduledAt) return failure("Please choose a date and time.");

  const denyReason = await assertTeacherCanManageTuition(profile.id, input.tuitionId);
  if (denyReason) return failure(denyReason);

  const supabase = await createClient();
  const { data: tuition } = await supabase
    .from("tuitions")
    .select("student_id")
    .eq("id", input.tuitionId)
    .maybeSingle();

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      tuition_id: input.tuitionId,
      teacher_id: profile.id,
      student_id: input.studentId ?? tuition?.student_id ?? null,
      scheduled_at: new Date(input.scheduledAt).toISOString(),
      end_at: input.endAt ? new Date(input.endAt).toISOString() : null,
      notes: input.notes || null,
      status: "scheduled",
    })
    .select("id")
    .single();

  if (error) return failure(error.message);

  revalidatePath("/dashboard/schedule");
  return success({ id: data.id });
}

export async function setSessionStatus(
  sessionId: string,
  status: "scheduled" | "completed" | "cancelled" | "rescheduled",
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (profile.role !== "teacher") return failure("Only teachers can manage classes.");

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("sessions")
    .select("teacher_id,status")
    .eq("id", sessionId)
    .maybeSingle();

  if (!existing || existing.teacher_id !== profile.id) {
    return failure("You can only manage your own classes.");
  }

  const { error } = await supabase
    .from("sessions")
    .update({ status })
    .eq("id", sessionId);

  if (error) return failure(error.message);

  revalidatePath("/dashboard/schedule");
  return success();
}

export async function setAttendance(
  sessionId: string,
  attendance: "present" | "absent",
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (profile.role !== "teacher") return failure("Only teachers can mark attendance.");

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("sessions")
    .select("teacher_id")
    .eq("id", sessionId)
    .maybeSingle();

  if (!existing || existing.teacher_id !== profile.id) {
    return failure("You can only manage your own classes.");
  }

  const { error } = await supabase
    .from("sessions")
    .update({ attendance, status: "completed" })
    .eq("id", sessionId);

  if (error) return failure(error.message);

  revalidatePath("/dashboard/schedule");
  return success();
}

export async function deleteSession(sessionId: string): Promise<ActionResult> {
  const profile = await requireProfile();
  if (profile.role !== "teacher") return failure("Only teachers can delete classes.");

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("sessions")
    .select("teacher_id")
    .eq("id", sessionId)
    .maybeSingle();

  if (!existing || existing.teacher_id !== profile.id) {
    return failure("You can only delete your own classes.");
  }

  const { error } = await supabase.from("sessions").delete().eq("id", sessionId);
  if (error) return failure(error.message);

  revalidatePath("/dashboard/schedule");
  return success();
}
