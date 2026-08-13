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
