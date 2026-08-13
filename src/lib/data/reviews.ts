import "server-only";
import { getDb, ok, fail, type DataResult } from "@/lib/data/client";

/** Whether the user has already reviewed this teacher. */
export async function hasReviewed(
  userId: string,
  teacherId: string,
): Promise<DataResult<boolean>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const { data, error } = await db
    .from("reviews")
    .select("id")
    .eq("reviewer_id", userId)
    .eq("teacher_id", teacherId)
    .maybeSingle();
  if (error) return fail(error.message);
  return ok(Boolean(data));
}

/** Whether the user has an accepted interaction with this teacher. */
export async function hasAcceptedInteraction(
  userId: string,
  teacherId: string,
): Promise<DataResult<boolean>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const { data, error } = await db
    .from("tuition_requests")
    .select("id")
    .eq("teacher_id", teacherId)
    .eq("status", "accepted")
    .or(`sender_id.eq.${userId},student_id.eq.${userId}`)
    .limit(1);
  if (error) return fail(error.message);
  return ok((data?.length ?? 0) > 0);
}
