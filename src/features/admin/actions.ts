"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/server-auth";
import { failure, success, type ActionResult } from "@/features/types";
import { type VerificationStatus } from "@/types/index";
import { isUuid } from "@/lib/utils";

const VERIFICATION_STATUSES: VerificationStatus[] = ["unverified", "pending", "verified", "rejected"];

export async function adminSetTuitionFeatured(
  tuitionId: string,
  featured: boolean,
): Promise<ActionResult> {
  const adminProfile = await requireAdmin();
  if (!isUuid(tuitionId)) return failure("টিউশন পরিচয় সঠিক নয়।");
  const supabase = await createClient();
  const { data: tuition, error: readError } = await supabase
    .from("tuitions")
    .select("id,status,is_featured,title")
    .eq("id", tuitionId)
    .maybeSingle();
  if (readError) return failure(readError.message);
  if (!tuition) return failure("টিউশন পাওয়া যায়নি।");
  if (featured && tuition.status !== "open") return failure("শুধু খোলা টিউশন feature করা যায়।");

  const { data, error } = await supabase.from("tuitions")
    .update({ is_featured: featured, featured_until: null })
    .eq("id", tuitionId)
    .select("id")
    .maybeSingle();
  if (error) return failure(error.message);
  if (!data) return failure("টিউশন feature করা যায়নি।");

  await supabase.from("admin_audit_log").insert({
    admin_id: adminProfile.id,
    action: "tuition_featuring",
    target_type: "tuition",
    target_id: tuitionId,
    details: { featured, title: tuition.title },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/tuitions");
  revalidatePath("/tuitions");
  revalidatePath(`/tuitions/${tuitionId}`);
  return success();
}

export async function adminSetVerification(
  userId: string,
  status: VerificationStatus,
): Promise<ActionResult> {
  await requireAdmin();
  if (!VERIFICATION_STATUSES.includes(status)) return failure("সঠিক ভেরিফিকেশন স্ট্যাটাস দিন।");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ verification_status: status })
    .eq("id", userId)
    .in("role", ["teacher", "student"])
    .select("id")
    .maybeSingle();
  if (error) return failure(error.message);
  if (!data) return failure("ব্যবহারকারী পাওয়া যায়নি বা ভেরিফিকেশন প্রযোজ্য নয়।");

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath(`/teachers/${userId}`);
  return success();
}

export async function adminSetAccountStatus(
  userId: string,
  status: "active" | "suspended" | "deleted",
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (userId === admin.id) return failure("নিজের অ্যাডমিন অ্যাকাউন্টের স্ট্যাটাস পরিবর্তন করা যাবে না।");

  const supabase = await createClient();
  const { data: target } = await supabase
    .from("profiles")
    .select("id,role,is_super_admin,account_status")
    .eq("id", userId)
    .maybeSingle();
  if (!target) return failure("ব্যবহারকারী পাওয়া যায়নি।");
  if (target.role === "admin" || target.is_super_admin) return failure("অ্যাডমিন বা সুপার অ্যাডমিন অ্যাকাউন্ট এখানে পরিবর্তন করা যাবে না।");
  if (target.account_status === status) return success();

  const { data, error } = await supabase
    .from("profiles")
    .update({ account_status: status })
    .eq("id", userId)
    .neq("role", "admin")
    .eq("is_super_admin", false)
    .select("id")
    .maybeSingle();
  if (error) return failure(error.message);
  if (!data) return failure("অ্যাকাউন্ট স্ট্যাটাস আপডেট করা যায়নি।");

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  return success();
}

const REPORT_TRANSITIONS: Record<string, Array<"investigating" | "resolved" | "dismissed">> = {
  open: ["investigating", "resolved", "dismissed"],
  investigating: ["resolved", "dismissed"],
  resolved: [],
  dismissed: [],
};

export async function adminResolveReport(
  reportId: string,
  status: "investigating" | "resolved" | "dismissed",
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("reports")
    .select("id,status")
    .eq("id", reportId)
    .maybeSingle();
  if (!existing) return failure("রিপোর্ট পাওয়া যায়নি।");
  if (!(REPORT_TRANSITIONS[existing.status] ?? []).includes(status)) {
    return failure("এই রিপোর্ট স্ট্যাটাস পরিবর্তন অনুমোদিত নয়।");
  }

  const { data, error } = await supabase
    .from("reports")
    .update({
      status,
      resolved_at: status === "resolved" || status === "dismissed" ? new Date().toISOString() : null,
    })
    .eq("id", reportId)
    .eq("status", existing.status)
    .select("id")
    .maybeSingle();
  if (error) return failure(error.message);
  if (!data) return failure("রিপোর্টটি অন্য কেউ আপডেট করেছে। পেজ রিফ্রেশ করুন।");

  revalidatePath("/admin/reports");
  revalidatePath("/admin");
  return success();
}

/** Premium status toggle (manual admin control until billing is connected). */
export async function adminSetPremium(
  teacherId: string,
  premium: boolean,
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      is_premium: premium,
      premium_until: null,
    })
    .eq("id", teacherId)
    .eq("role", "teacher")
    .select("id")
    .maybeSingle();
  if (error) return failure(error.message);
  if (!data) return failure("শিক্ষক পাওয়া যায়নি।");

  revalidatePath("/admin/users");
  revalidatePath(`/teachers/${teacherId}`);
  return success();
}
