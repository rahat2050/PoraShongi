"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/server-auth";
import { isSupabaseConfigured } from "@/lib/env";
import { failure, success, type ActionResult } from "@/features/types";
import { tutorLeadSchema, type TutorLeadInput } from "@/validation/lead";
import { type TutorLeadStatus } from "@/types/index";

/**
 * Coarse, non-reversible network identifier used only to rate-limit abuse.
 *
 * আমরা কাঁচা IP কখনো সংরক্ষণ করি না — একটি daily-rotating salt দিয়ে hash করা হয়,
 * ফলে পরদিন একই IP আলাদা hash পায় এবং দীর্ঘমেয়াদি tracking অসম্ভব।
 */
async function getIpHash(): Promise<string | null> {
  try {
    const headerList = await headers();
    const forwarded = headerList.get("x-forwarded-for")?.split(",", 1)[0]?.trim();
    const ip = forwarded || headerList.get("x-real-ip")?.trim();
    if (!ip) return null;
    const day = new Date().toISOString().slice(0, 10);
    return createHash("sha256").update(`porasathi:${day}:${ip}`).digest("hex").slice(0, 32);
  } catch {
    return null;
  }
}

/**
 * Public, login-free tutor request.
 *
 * এটি সরাসরি `tuitions` টেবিলে লেখে না — একটি আলাদা moderated inbox-এ যায়, যাতে
 * spam প্রকাশিত টিউশন তালিকা দূষিত করতে না পারে।
 */
export async function submitTutorLead(input: TutorLeadInput): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return failure("সার্ভার এখনো প্রস্তুত নয়। একটু পরে আবার চেষ্টা করুন।");
  }

  const parsed = tutorLeadSchema.safeParse(input);
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "তথ্য সঠিকভাবে পূরণ করুন।");
  }

  // Honeypot: বট field পূরণ করলে সফলতার ভান করি, কিছু লিখি না।
  if (parsed.data.website) return success();

  const value = parsed.data;
  const db = createPublicClient(0);
  if (!db) return failure("সার্ভার এখনো প্রস্তুত নয়। একটু পরে আবার চেষ্টা করুন।");

  const { data, error } = await db.rpc("submit_tutor_lead", {
    p_contact_name: value.contactName,
    p_contact_phone: value.contactPhone,
    p_class_level: value.classLevel,
    p_subjects: value.subjects,
    p_teaching_mode: value.teachingMode,
    p_district: value.district || null,
    p_area: value.area || null,
    p_preferred_days: value.preferredDays ?? [],
    p_preferred_time: value.preferredTime || null,
    p_budget: value.budget,
    p_note: value.note || null,
    p_contact_email: value.contactEmail || null,
    p_ip_hash: await getIpHash(),
  });

  if (error) return failure(error.message);

  const result = data as { ok?: boolean; error?: string } | null;
  if (!result?.ok) return failure(result?.error ?? "অনুরোধ পাঠানো যায়নি। আবার চেষ্টা করুন।");

  return success();
}

/** Admin: move a lead through the new → contacted → matched → closed workflow. */
export async function updateTutorLeadStatus(
  leadId: string,
  status: TutorLeadStatus,
  adminNote?: string,
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_update_tutor_lead", {
    p_lead_id: leadId,
    p_status: status,
    p_admin_note: adminNote?.trim() || null,
  });

  if (error) return failure(error.message);

  const result = data as { ok?: boolean; error?: string } | null;
  if (!result?.ok) return failure(result?.error ?? "আপডেট করা যায়নি।");

  revalidatePath("/admin/leads");
  return success();
}
