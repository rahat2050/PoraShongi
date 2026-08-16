"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/server-auth";
import { failure, success, type ActionResult } from "@/features/types";

/** Account নিজে নিষ্ক্রিয় (soft-delete) / চালু — privacy setting। */
export async function setAccountActive(active: boolean): Promise<ActionResult> {
  await requireProfile();
  const supabase = await createClient();

  const { error } = await supabase.rpc("toggle_own_account", { p_active: active });
  if (error) return failure(error.message);

  revalidatePath("/account");
  revalidatePath("/dashboard");
  return success();
}

/** নিজের profile row-এর সাম্প্রতিক status (server) — account page-এর জন্য। */
export async function getAccountStatusServer(): Promise<"active" | "deleted"> {
  const profile = await requireProfile();
  return profile.account_status === "deleted" ? "deleted" : "active";
}
