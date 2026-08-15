import "server-only";
import { getDb, ok, fail, type DataResult } from "@/lib/data/client";
import { type ContactRequest } from "@/types/index";

export async function getContactStatus(
  senderId: string,
  teacherId: string,
): Promise<DataResult<ContactRequest | null>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("contact_requests")
    .select("id,sender_id,teacher_id,status,created_at,responded_at")
    .eq("sender_id", senderId)
    .eq("teacher_id", teacherId)
    .maybeSingle();
  if (error) return fail(error.message);
  return ok((data as ContactRequest | null) ?? null);
}

export async function listReceivedContactRequests(
  teacherId: string,
): Promise<DataResult<ContactRequest[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("contact_requests")
    .select("id,sender_id,teacher_id,status,created_at,responded_at")
    .eq("teacher_id", teacherId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return fail(error.message);
  return ok((data ?? []) as ContactRequest[]);
}

/** accepted হলে teacher-এর ফোন দেখায় (RPC auth.uid() দিয়ে নিরাপদ)। */
export async function getTeacherPhone(
  teacherId: string,
): Promise<DataResult<string | null>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db.rpc("get_teacher_phone", { p_teacher_id: teacherId });
  if (error) return fail(error.message);
  return ok(typeof data === "string" ? data : null);
}
