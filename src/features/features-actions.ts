"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile, requireRole } from "@/lib/auth/server-auth";
import { failure, success, type ActionResult } from "@/features/types";

/** Student batch tuition-এ join করে। */
export async function joinBatch(tuitionId: string): Promise<ActionResult> {
  const profile = await requireProfile();
  if (profile.role !== "student") return failure("শুধু শিক্ষার্থী batch-এ join করতে পারবেন।");

  const supabase = await createClient();
  const { data: tuition } = await supabase
    .from("tuitions")
    .select("is_batch,batch_size,seats_filled,poster_id,status")
    .eq("id", tuitionId)
    .maybeSingle();

  if (!tuition || !tuition.is_batch || tuition.status !== "open") return failure("এই ব্যাচ টিউশন এখন যোগদানের জন্য খোলা নেই।");
  if (tuition.poster_id === profile.id) return failure("নিজের ব্যাচে যোগ দেওয়া যায় না।");
  if (tuition.batch_size && tuition.seats_filled >= tuition.batch_size) {
    return failure("সিট পূর্ণ — আর জায়গা নেই।");
  }

  const { data, error } = await supabase
    .from("batch_members")
    .insert({ tuition_id: tuitionId, student_id: profile.id })
    .select("id")
    .maybeSingle();
  if (error) {
    if (error.code === "23505") return failure("আপনি আগেই এই ব্যাচে যোগ দিয়েছেন।");
    return failure(error.message);
  }
  if (!data) return failure("ব্যাচে যোগ দেওয়া যায়নি।");

  revalidatePath(`/tuitions/${tuitionId}`);
  return success();
}

export async function leaveBatch(tuitionId: string): Promise<ActionResult> {
  const profile = await requireProfile();
  if (profile.role !== "student") return failure("শুধু শিক্ষার্থী ব্যাচ থেকে বের হতে পারবেন।");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("batch_members")
    .delete()
    .eq("tuition_id", tuitionId)
    .eq("student_id", profile.id)
    .select("id")
    .maybeSingle();
  if (error) return failure(error.message);
  if (!data) return failure("আপনি এই ব্যাচে যুক্ত নন।");

  revalidatePath(`/tuitions/${tuitionId}`);
  return success();
}

/** Student trial class request পাঠায়। */
export async function sendTrialRequest(
  teacherId: string,
  message?: string,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (profile.role !== "student" && profile.role !== "guardian") {
    return failure("শুধু শিক্ষার্থী বা অভিভাবক ট্রায়াল ক্লাস চাইতে পারবেন।");
  }
  if ((message?.trim().length ?? 0) > 1000) return failure("বার্তা সর্বোচ্চ ১০০০ অক্ষরের হতে পারে।");

  const supabase = await createClient();
  const [{ data: teacher }, { data: teacherProfile }] = await Promise.all([
    supabase.from("profiles").select("id").eq("id", teacherId).eq("role", "teacher").eq("account_status", "active").maybeSingle(),
    supabase.from("teacher_profiles").select("trial_available").eq("id", teacherId).maybeSingle(),
  ]);
  if (!teacher || !teacherProfile?.trial_available) return failure("এই শিক্ষক এখন ট্রায়াল ক্লাস নিচ্ছেন না।");
  const { error } = await supabase.from("trial_requests").insert({
    sender_id: profile.id,
    teacher_id: teacherId,
    message: message?.trim() || null,
    status: "pending",
  });
  if (error) {
    if (error.code === "23505") return failure("আপনার ট্রায়াল ক্লাসের অনুরোধ আগেই পাঠানো আছে।");
    return failure(error.message);
  }
  revalidatePath(`/teachers/${teacherId}`);
  return success();
}

/** Teacher trial request accept/reject করে। */
export async function respondTrialRequest(
  requestId: string,
  decision: "accepted" | "rejected",
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (profile.role !== "teacher") return failure("শুধু শিক্ষক ট্রায়াল অনুরোধের উত্তর দিতে পারবেন।");

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("trial_requests")
    .select("teacher_id,status")
    .eq("id", requestId)
    .maybeSingle();

  if (!existing || existing.teacher_id !== profile.id) {
    return failure("শুধু নিজের কাছে আসা ট্রায়াল অনুরোধের উত্তর দিতে পারবেন।");
  }
  if (existing.status !== "pending") return failure("উত্তর দেওয়া হয়েছে।");

  const { data, error } = await supabase
    .from("trial_requests")
    .update({ status: decision })
    .eq("id", requestId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (error) return failure(error.message);
  if (!data) return failure("ট্রায়াল অনুরোধটি অন্য কেউ আপডেট করেছে।");

  revalidatePath("/dashboard");
  return success();
}

/** Admin blog post তৈরি করে। */
export async function createBlogPost(input: {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category: string;
}): Promise<ActionResult<{ slug: string }>> {
  const profile = await requireRole(["admin", "teacher"]);

  const title = input.title.trim();
  const slug = input.slug.trim().toLowerCase().replace(/\s+/g, "-");
  if (title.length < 3 || slug.length < 3) return failure("টাইটেল ও slug দিন।");
  if (input.content.trim().length < 10) return failure("কনটেন্ট লিখুন।");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      author_id: profile.id,
      title,
      slug,
      excerpt: input.excerpt?.trim() || null,
      content: input.content.trim(),
      category: input.category,
      published: true,
    })
    .select("slug")
    .single();

  if (error) {
    if (error.code === "23505") return failure("এই slug আগে ব্যবহৃত হয়েছে।");
    return failure(error.message);
  }

  revalidatePath("/blog");
  return success({ slug: data.slug });
}
