"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/server-auth";
import { tuitionSchema } from "@/validation/tuition";
import { failure, success, type ActionResult } from "@/features/types";
import { type TuitionStatus } from "@/types/index";

export interface TuitionFormInput {
  title: string;
  classLevel: string;
  subject: string;
  district?: string;
  area?: string;
  budget?: number | null;
  budgetNegotiable?: boolean;
  teachingMode: string;
  preferredDays?: string[];
  preferredTime?: string;
  requirements?: string;
  isBatch?: boolean;
  batchSize?: number | null;
}

async function guardianLinkedStudent(profileId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("guardian_profiles")
    .select("linked_student_id")
    .eq("id", profileId)
    .maybeSingle();
  return (data?.linked_student_id as string | null) ?? null;
}

export async function createTuition(
  input: TuitionFormInput,
): Promise<ActionResult<{ id: string }>> {
  const profile = await requireProfile();
  if (profile.role !== "student" && profile.role !== "guardian") {
    return failure("শুধু শিক্ষার্থী বা অভিভাবক টিউশন তৈরি করতে পারবেন।");
  }
  const parsed = tuitionSchema.safeParse(input);
  if (!parsed.success) return failure(parsed.error.issues[0]?.message ?? "তথ্যগুলো পরীক্ষা করুন।");
  if (parsed.data.teachingMode !== "online" && !parsed.data.district) {
    return failure("সরাসরি পড়ানোর টিউশনের জন্য জেলা নির্বাচন করুন।");
  }
  if (input.isBatch && (!input.batchSize || input.batchSize < 2 || input.batchSize > 200)) {
    return failure("ব্যাচের শিক্ষার্থী সংখ্যা ২–২০০ এর মধ্যে হতে হবে।");
  }

  let studentId: string | null = null;
  if (profile.role === "student") studentId = profile.id;
  if (profile.role === "guardian") studentId = await guardianLinkedStudent(profile.id);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tuitions")
    .insert({
      poster_id: profile.id,
      student_id: studentId,
      title: parsed.data.title,
      class_level: parsed.data.classLevel,
      subject: parsed.data.subject,
      district: parsed.data.district || null,
      area: parsed.data.area || null,
      budget: parsed.data.budget,
      budget_negotiable: Boolean(parsed.data.budgetNegotiable),
      teaching_mode: parsed.data.teachingMode,
      preferred_days: parsed.data.preferredDays ?? null,
      preferred_time: parsed.data.preferredTime || null,
      requirements: parsed.data.requirements || null,
      is_batch: Boolean(input.isBatch),
      batch_size: input.isBatch ? input.batchSize ?? null : null,
      status: "open",
    })
    .select("id")
    .single();

  if (error) return failure(error.message);

  revalidatePath("/dashboard/tuitions");
  revalidatePath("/tuitions");
  return success({ id: data.id });
}

export async function updateTuition(
  tuitionId: string,
  input: TuitionFormInput,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (profile.role !== "student" && profile.role !== "guardian") {
    return failure("শুধু শিক্ষার্থী বা অভিভাবক টিউশন সম্পাদনা করতে পারবেন।");
  }
  const parsed = tuitionSchema.safeParse(input);
  if (!parsed.success) return failure(parsed.error.issues[0]?.message ?? "তথ্যগুলো পরীক্ষা করুন।");
  if (parsed.data.teachingMode !== "online" && !parsed.data.district) {
    return failure("সরাসরি পড়ানোর টিউশনের জন্য জেলা নির্বাচন করুন।");
  }
  if (input.isBatch && (!input.batchSize || input.batchSize < 2 || input.batchSize > 200)) {
    return failure("ব্যাচের শিক্ষার্থী সংখ্যা ২–২০০ এর মধ্যে হতে হবে।");
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("tuitions")
    .select("poster_id")
    .eq("id", tuitionId)
    .maybeSingle();

  if (!existing || existing.poster_id !== profile.id) {
    return failure("শুধু নিজের tuition edit করতে পারবেন।");
  }

  const { error } = await supabase
    .from("tuitions")
    .update({
      title: parsed.data.title,
      class_level: parsed.data.classLevel,
      subject: parsed.data.subject,
      district: parsed.data.district || null,
      area: parsed.data.area || null,
      budget: parsed.data.budget,
      budget_negotiable: Boolean(parsed.data.budgetNegotiable),
      teaching_mode: parsed.data.teachingMode,
      preferred_days: parsed.data.preferredDays ?? null,
      preferred_time: parsed.data.preferredTime || null,
      requirements: parsed.data.requirements || null,
      is_batch: Boolean(input.isBatch),
      batch_size: input.isBatch ? input.batchSize ?? null : null,
    })
    .eq("id", tuitionId);

  if (error) return failure(error.message);

  revalidatePath("/dashboard/tuitions");
  revalidatePath(`/dashboard/tuitions/${tuitionId}`);
  revalidatePath("/tuitions");
  return success();
}

const OWNER_STATUS_TRANSITIONS: Record<string, TuitionStatus[]> = {
  open: ["paused", "closed"],
  paused: ["open", "closed"],
  assigned: ["completed", "paused"],
  completed: [],
  closed: [],
};

export async function setTuitionStatus(
  tuitionId: string,
  status: TuitionStatus,
): Promise<ActionResult> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("tuitions")
    .select("poster_id,status")
    .eq("id", tuitionId)
    .maybeSingle();

  if (!existing || existing.poster_id !== profile.id) {
    return failure("শুধু নিজের tuition manage করতে পারবেন।");
  }

  const allowed = OWNER_STATUS_TRANSITIONS[existing.status as TuitionStatus] ?? [];
  if (!allowed.includes(status)) return failure("এই status change allowed না।");

  const { error } = await supabase.from("tuitions").update({ status }).eq("id", tuitionId);
  if (error) return failure(error.message);

  revalidatePath("/dashboard/tuitions");
  revalidatePath(`/dashboard/tuitions/${tuitionId}`);
  revalidatePath("/tuitions");
  return success();
}

export async function deleteTuition(tuitionId: string): Promise<ActionResult> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("tuitions")
    .select("poster_id")
    .eq("id", tuitionId)
    .maybeSingle();

  if (!existing || existing.poster_id !== profile.id) {
    return failure("শুধু নিজের tuition delete করতে পারবেন।");
  }

  const { error } = await supabase.from("tuitions").delete().eq("id", tuitionId);
  if (error) return failure(error.message);

  revalidatePath("/dashboard/tuitions");
  revalidatePath("/tuitions");
  return success();
}

/** Meeting link সেট (teacher/owner) — online class-এর জন্য (Meet/Zoom)। */
export async function setMeetingLink(
  tuitionId: string,
  link: string,
): Promise<ActionResult> {
  const profile = await requireProfile();
  const trimmed = link.trim();
  if (trimmed && !/^https?:\/\//.test(trimmed)) {
    return failure("সঠিক লিংক দিন (https:// দিয়ে শুরু)।");
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("tuitions")
    .select("poster_id")
    .eq("id", tuitionId)
    .maybeSingle();

  if (!existing) return failure("টিউশন পাওয়া যায়নি।");

  const isOwner = existing.poster_id === profile.id;
  let isAcceptedTeacher = false;
  if (profile.role === "teacher") {
    const { data: accepted } = await supabase
      .from("tuition_requests")
      .select("id")
      .eq("tuition_id", tuitionId)
      .eq("teacher_id", profile.id)
      .eq("status", "accepted")
      .maybeSingle();
    isAcceptedTeacher = Boolean(accepted);
  }

  if (!isOwner && !isAcceptedTeacher && profile.role !== "admin") {
    return failure("শুধু টিউশনের মালিক বা গৃহীত শিক্ষক ক্লাসের লিংক দিতে পারবেন।");
  }

  const { error } = await supabase
    .from("tuitions")
    .update({ meeting_link: trimmed || null })
    .eq("id", tuitionId);
  if (error) return failure(error.message);

  revalidatePath(`/dashboard/tuitions/${tuitionId}`);
  revalidatePath(`/tuitions/${tuitionId}`);
  return success();
}
