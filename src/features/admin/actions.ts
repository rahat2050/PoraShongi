"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/server-auth";
import { failure, success, type ActionResult } from "@/features/types";
import { type VerificationStatus } from "@/types/index";

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
  revalidatePath("/admin");
  return success();
}

export async function adminSetAccountStatus(
  userId: string,
  status: "active" | "suspended" | "deleted",
): Promise<ActionResult> {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ account_status: status })
    .eq("id", userId);
  if (error) return failure(error.message);
  revalidatePath("/admin");
  return success();
}

export async function adminResolveReport(
  reportId: string,
  status: "investigating" | "resolved" | "dismissed",
): Promise<ActionResult> {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { error } = await supabase
    .from("reports")
    .update({
      status,
      resolved_at: status === "resolved" || status === "dismissed" ? new Date().toISOString() : null,
    })
    .eq("id", reportId);
  if (error) return failure(error.message);
  revalidatePath("/admin/reports");
  return success();
}

/** Premium teacher চালু/বন্ধ (admin — payment এখনো নেই)। */
export async function adminSetPremium(
  teacherId: string,
  premium: boolean,
): Promise<ActionResult> {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      is_premium: premium,
      premium_until: premium ? null : null,
    })
    .eq("id", teacherId)
    .eq("role", "teacher");
  if (error) return failure(error.message);
  revalidatePath("/admin/users");
  return success();
}
