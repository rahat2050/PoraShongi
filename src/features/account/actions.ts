"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/server-auth";
import { failure, success, type ActionResult } from "@/features/types";

export async function permanentlyDeleteAccount(confirmation: string): Promise<ActionResult> {
  const profile = await requireProfile();
  if (profile.role === "admin" || profile.is_super_admin) return failure("Admin account delete করার আগে ownership transfer করুন।");
  if (confirmation !== "DELETE MY ACCOUNT") return failure("Deletion confirmation সঠিক নয়।");
  const supabase = await createClient();
  const { error } = await supabase.rpc("permanently_delete_own_account", { p_confirmation: confirmation });
  if (error) return failure(error.message);
  return success();
}

/** Account নিজে নিষ্ক্রিয় (soft-delete) / চালু — privacy setting। */
export async function setAccountActive(active: boolean): Promise<ActionResult> {
  const profile = await requireProfile({ allowInactive: true });
  if (profile.account_status === "suspended") {
    return failure("স্থগিত অ্যাকাউন্ট শুধু অ্যাডমিন পুনরায় চালু করতে পারবেন।");
  }
  const supabase = await createClient();

  const { error } = await supabase.rpc("toggle_own_account", { p_active: active });
  if (error) return failure(error.message);

  revalidatePath("/account");
  revalidatePath("/dashboard");
  return success();
}

/** নিজের profile row-এর সাম্প্রতিক status (server) — account page-এর জন্য। */
export async function getAccountStatusServer(): Promise<"active" | "deleted"> {
  const profile = await requireProfile({ allowInactive: true });
  return profile.account_status === "deleted" ? "deleted" : "active";
}
