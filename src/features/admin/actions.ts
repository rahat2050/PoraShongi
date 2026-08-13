"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/server-auth";
import { failure, success, type ActionResult } from "@/features/types";
import { type VerificationStatus } from "@/types/index";

/** Set a teacher's verification status (admin only). */
export async function adminSetVerification(
  teacherId: string,
  status: VerificationStatus,
): Promise<ActionResult> {
  await requireRole(["admin"]);
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ verification_status: status })
    .eq("id", teacherId)
    .eq("role", "teacher");

  if (error) return failure(error.message);

  revalidatePath("/admin/teachers");
  revalidatePath("/admin/verification");
  revalidatePath("/admin/users");
  return success();
}

/** Suspend or re-activate a user account (admin only). */
export async function adminSetAccountStatus(
  userId: string,
  suspend: boolean,
): Promise<ActionResult> {
  await requireRole(["admin"]);
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ account_status: suspend ? "suspended" : "active" })
    .eq("id", userId);

  if (error) return failure(error.message);

  revalidatePath("/admin/users");
  revalidatePath("/admin/teachers");
  revalidatePath("/admin/students");
  revalidatePath("/admin/guardians");
  return success();
}

/** Remove an inappropriate tuition post (admin only). */
export async function adminDeleteTuition(
  tuitionId: string,
): Promise<ActionResult> {
  await requireRole(["admin"]);
  const supabase = await createClient();

  const { error } = await supabase
    .from("tuitions")
    .delete()
    .eq("id", tuitionId);

  if (error) return failure(error.message);

  revalidatePath("/admin/tuitions");
  revalidatePath("/tuitions");
  return success();
}

/** Set a teacher's verification tier flags (admin only). */
export async function adminSetVerificationFlags(
  teacherId: string,
  flags: {
    phoneVerified?: boolean;
    educationVerified?: boolean;
    identityVerified?: boolean;
    trusted?: boolean;
  },
): Promise<ActionResult> {
  await requireRole(["admin"]);
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      phone_verified: flags.phoneVerified ?? false,
      education_verified: flags.educationVerified ?? false,
      identity_verified: flags.identityVerified ?? false,
      trusted_tutor: flags.trusted ?? false,
      verification_status:
        flags.educationVerified || flags.identityVerified || flags.trusted
          ? "verified"
          : "pending",
    })
    .eq("id", teacherId)
    .eq("role", "teacher");

  if (error) return failure(error.message);

  revalidatePath("/admin/teachers");
  revalidatePath("/admin/verification");
  revalidatePath("/admin/users");
  return success();
}

/** Resolve / investigate / dismiss a report (admin only). */
export async function adminResolveReport(
  reportId: string,
  status: "investigating" | "resolved" | "dismissed",
  resolution?: string,
): Promise<ActionResult> {
  await requireRole(["admin"]);
  const supabase = await createClient();

  const { error } = await supabase
    .from("reports")
    .update({
      status,
      resolution: resolution?.trim() || null,
      resolved_at: status === "resolved" || status === "dismissed" ? new Date().toISOString() : null,
    })
    .eq("id", reportId);

  if (error) return failure(error.message);

  revalidatePath("/admin/reports");
  return success();
}

/** Moderate a review: hide, publish, or remove (admin only). */
export async function adminModerateReview(
  reviewId: string,
  action: "hide" | "publish" | "remove",
): Promise<ActionResult> {
  await requireRole(["admin"]);
  const supabase = await createClient();

  if (action === "remove") {
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
    if (error) return failure(error.message);
  } else {
    const { error } = await supabase
      .from("reviews")
      .update({ status: action === "hide" ? "hidden" : "published" })
      .eq("id", reviewId);
    if (error) return failure(error.message);
  }

  revalidatePath("/admin/reviews");
  return success();
}
