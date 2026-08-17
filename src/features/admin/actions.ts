"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/server-auth";
import { failure, success, type ActionResult } from "@/features/types";
import { type VerificationStatus } from "@/types/index";

const VERIFICATION_STATUSES: VerificationStatus[] = ["unverified", "pending", "verified", "rejected"];

export async function adminSetVerification(
  userId: string,
  status: VerificationStatus,
): Promise<ActionResult> {
  await requireRole(["admin"]);
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
  const admin = await requireRole(["admin"]);
  if (userId === admin.id) return failure("নিজের অ্যাডমিন অ্যাকাউন্টের স্ট্যাটাস পরিবর্তন করা যাবে না।");

  const supabase = await createClient();
  const { data: target } = await supabase
    .from("profiles")
    .select("id,role,account_status")
    .eq("id", userId)
    .maybeSingle();
  if (!target) return failure("ব্যবহারকারী পাওয়া যায়নি।");
  if (target.role === "admin") return failure("এই প্যানেল থেকে অন্য অ্যাডমিন অ্যাকাউন্ট পরিবর্তন করা যাবে না।");
  if (target.account_status === status) return success();

  const { data, error } = await supabase
    .from("profiles")
    .update({ account_status: status })
    .eq("id", userId)
    .neq("role", "admin")
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
  await requireRole(["admin"]);
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
  await requireRole(["admin"]);
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
