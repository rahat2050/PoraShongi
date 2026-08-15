"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/server-auth";
import { failure, success, type ActionResult } from "@/features/types";

export async function sendContactRequest(
  teacherId: string,
): Promise<ActionResult<{ status: "pending" | "accepted" | "rejected" }>> {
  const profile = await requireProfile();
  if (profile.role !== "student" && profile.role !== "guardian") {
    return failure("শুধু শিক্ষার্থী/অভিভাবক যোগাযোগ চাইতে পারবেন।");
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("contact_requests")
    .select("status")
    .eq("sender_id", profile.id)
    .eq("teacher_id", teacherId)
    .maybeSingle();

  if (existing) {
    return success({ status: existing.status as "pending" | "accepted" | "rejected" });
  }

  const { error } = await supabase.from("contact_requests").insert({
    sender_id: profile.id,
    teacher_id: teacherId,
    status: "pending",
  });
  if (error) {
    if (error.code === "23505") return failure("আপনি আগেই অনুরোধ করেছেন।");
    return failure(error.message);
  }

  revalidatePath("/dashboard/requests");
  return success({ status: "pending" });
}

export async function respondContactRequest(
  requestId: string,
  decision: "accepted" | "rejected",
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (profile.role !== "teacher") return failure("শুধু শিক্ষক respond করতে পারবেন।");

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("contact_requests")
    .select("teacher_id,status")
    .eq("id", requestId)
    .maybeSingle();

  if (!existing || existing.teacher_id !== profile.id) {
    return failure("শুধু নিজের অনুরোধ respond করতে পারবেন।");
  }
  if (existing.status !== "pending") return failure("এই অনুরোধের উত্তর দেওয়া হয়েছে।");

  const { error } = await supabase
    .from("contact_requests")
    .update({ status: decision })
    .eq("id", requestId);
  if (error) return failure(error.message);

  revalidatePath("/dashboard/requests");
  return success();
}
