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
  if (profile.role !== "teacher") return failure("শুধু গৃহীত শিক্ষক ক্লাসের সময় নির্ধারণ করতে পারবেন।");

  const scheduledAt = new Date(input.scheduledAt);
  const now = Date.now();
  if (Number.isNaN(scheduledAt.getTime())) return failure("সঠিক তারিখ ও সময় দিন।");
  if (scheduledAt.getTime() < now - 5 * 60_000) return failure("অতীতের সময়ে নতুন ক্লাস তৈরি করা যাবে না।");
  if (scheduledAt.getTime() > now + 366 * 24 * 60 * 60_000) return failure("ক্লাসের সময় এক বছরের মধ্যে হতে হবে।");
  if ((input.notes?.trim().length ?? 0) > 500) return failure("নোট সর্বোচ্চ ৫০০ অক্ষরের হতে পারে।");

  const supabase = await createClient();
  const { data: accepted } = await supabase
    .from("tuition_requests")
    .select("student_id")
    .eq("tuition_id", input.tuitionId)
    .eq("teacher_id", profile.id)
    .eq("status", "accepted")
    .maybeSingle();
  if (!accepted) return failure("এই টিউশনটি আপনার গৃহীত টিউশন নয়।");

  const { data: tuition } = await supabase.rpc("get_public_tuition", {
    p_tuition_id: input.tuitionId,
  });
  const tuitionInfo = tuition as {
    student_id?: string | null;
    status?: string;
  } | null;
  if (!tuitionInfo || tuitionInfo.status !== "assigned") {
    return failure("শুধু চলমান ও নিয়োগকৃত টিউশনের ক্লাস তৈরি করা যাবে।");
  }

  const { error } = await supabase.from("sessions").insert({
    tuition_id: input.tuitionId,
    teacher_id: profile.id,
    student_id: accepted.student_id ?? tuitionInfo.student_id ?? null,
    scheduled_at: scheduledAt.toISOString(),
    notes: input.notes?.trim() || null,
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
  if (profile.role !== "teacher") return failure("শুধু শিক্ষক ক্লাসের অবস্থা বদলাতে পারবেন।");
  if (status !== "cancelled" && status !== "rescheduled") {
    return failure("এই অবস্থা পরিবর্তন অনুমোদিত নয়।");
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("sessions")
    .select("id,status")
    .eq("id", sessionId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!existing) return failure("ক্লাস পাওয়া যায়নি।");
  if (existing.status !== "scheduled" && existing.status !== "rescheduled") {
    return failure("এই ক্লাসের অবস্থা আর পরিবর্তন করা যাবে না।");
  }

  const { data, error } = await supabase
    .from("sessions")
    .update({ status })
    .eq("id", sessionId)
    .eq("teacher_id", profile.id)
    .select("id")
    .maybeSingle();
  if (error) return failure(error.message);
  if (!data) return failure("ক্লাস আপডেট করা যায়নি।");
  revalidatePath("/dashboard/schedule");
  return success();
}

export async function setAttendance(
  sessionId: string,
  attendance: "present" | "absent",
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (profile.role !== "teacher") return failure("শুধু শিক্ষক উপস্থিতি দিতে পারবেন।");

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("sessions")
    .select("id,status")
    .eq("id", sessionId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!existing) return failure("ক্লাস পাওয়া যায়নি।");
  if (existing.status !== "scheduled" && existing.status !== "rescheduled") {
    return failure("এই ক্লাসের উপস্থিতি আগেই চূড়ান্ত হয়েছে।");
  }

  const { data, error } = await supabase
    .from("sessions")
    .update({ attendance, status: "completed" })
    .eq("id", sessionId)
    .eq("teacher_id", profile.id)
    .select("id")
    .maybeSingle();
  if (error) return failure(error.message);
  if (!data) return failure("উপস্থিতি সেভ করা যায়নি।");
  revalidatePath("/dashboard/schedule");
  return success();
}

export async function deleteSession(sessionId: string): Promise<ActionResult> {
  const profile = await requireProfile();
  if (profile.role !== "teacher") return failure("শুধু শিক্ষক ক্লাস মুছতে পারবেন।");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId)
    .eq("teacher_id", profile.id)
    .select("id")
    .maybeSingle();
  if (error) return failure(error.message);
  if (!data) return failure("ক্লাস পাওয়া যায়নি বা মুছতে অনুমতি নেই।");
  revalidatePath("/dashboard/schedule");
  return success();
}
