"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/server-auth";
import { failure, success, type ActionResult } from "@/features/types";

const MAX_PENDING_REQUESTS = 5;

export async function sendTuitionRequest(input: {
  tuitionId: string;
  teacherId: string;
  message?: string;
}): Promise<ActionResult<{ id: string }>> {
  const profile = await requireProfile();
  if (profile.role !== "student" && profile.role !== "guardian") {
    return failure("শুধু শিক্ষার্থী বা অভিভাবক অনুরোধ পাঠাতে পারবেন।");
  }
  if ((input.message?.trim().length ?? 0) > 1000) {
    return failure("বার্তা সর্বোচ্চ ১০০০ অক্ষরের হতে পারে।");
  }
  if (input.teacherId === profile.id) return failure("নিজেকে অনুরোধ পাঠানো যাবে না।");

  // স্প্যাম সুরক্ষা: একসঙ্গে ৫টির বেশি অপেক্ষমাণ অনুরোধ রাখা যাবে না।
  const supabase = await createClient();
  const { data: pendingCount } = await supabase.rpc("pending_request_count", {
    p_user_id: profile.id,
  });
  if ((pendingCount ?? 0) >= MAX_PENDING_REQUESTS) {
    return failure(`আপনার ${MAX_PENDING_REQUESTS}টি অনুরোধ এখনো অপেক্ষমাণ—আগে সেগুলোর উত্তর দেখুন।`);
  }

  let studentId: string | null = profile.role === "student" ? profile.id : null;
  if (profile.role === "guardian") {
    const { data: gp } = await supabase
      .from("guardian_profiles")
      .select("linked_student_id")
      .eq("id", profile.id)
      .maybeSingle();
    studentId = (gp?.linked_student_id as string | null) ?? null;
  }

  const { data: tuition } = await supabase.rpc("get_public_tuition", {
    p_tuition_id: input.tuitionId,
  });
  const tuitionInfo = tuition as {
    poster_id?: string;
    student_id?: string | null;
    status?: string;
  } | null;
  if (!tuitionInfo || tuitionInfo.status !== "open") {
    return failure("নির্বাচিত টিউশনটি আর খোলা নেই।");
  }

  const ownsTuition =
    tuitionInfo.poster_id === profile.id ||
    tuitionInfo.student_id === profile.id ||
    (studentId != null && tuitionInfo.student_id === studentId);
  if (!ownsTuition) return failure("শুধু নিজের টিউশনের জন্য শিক্ষককে অনুরোধ পাঠানো যাবে।");

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
      return failure("আপনি ইতিমধ্যে এই শিক্ষককে অনুরোধ পাঠিয়েছেন।");
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
  if (profile.role !== "teacher") return failure("শুধু শিক্ষক অনুরোধের উত্তর দিতে পারবেন।");

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("tuition_requests")
    .select("teacher_id,status,tuition_id")
    .eq("id", requestId)
    .maybeSingle();

  if (!existing || existing.teacher_id !== profile.id) {
    return failure("শুধু নিজের কাছে আসা অনুরোধের উত্তর দিতে পারবেন।");
  }
  if (existing.status !== "pending") return failure("এই অনুরোধের উত্তর ইতিমধ্যে দেওয়া হয়েছে।");

  if (decision === "accepted") {
    const { data: tuition } = await supabase
      .from("tuitions")
      .select("status")
      .eq("id", existing.tuition_id)
      .maybeSingle();
    if (!tuition || tuition.status !== "open") {
      return failure("এই টিউশন ইতিমধ্যে অন্য শিক্ষককে দেওয়া হয়েছে বা বন্ধ হয়েছে।");
    }
  }

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

  if (!existing || !involved) return failure("শুধু নিজের অনুরোধ প্রত্যাহার করতে পারবেন।");
  if (existing.status !== "pending") return failure("এই অনুরোধ আর প্রত্যাহার করা যাবে না।");

  const { error } = await supabase
    .from("tuition_requests")
    .update({ status: "withdrawn" })
    .eq("id", requestId);

  if (error) return failure(error.message);

  revalidatePath("/dashboard/requests");
  return success();
}
