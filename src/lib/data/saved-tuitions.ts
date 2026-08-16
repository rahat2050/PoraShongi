import "server-only";
import { getDb, ok, fail, type DataResult } from "@/lib/data/client";

export async function isTuitionSaved(
  userId: string,
  tuitionId: string,
): Promise<DataResult<boolean>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("tuition_id", tuitionId)
    .maybeSingle();
  if (error) return fail(error.message);
  return ok(Boolean(data));
}

export async function listSavedTuitionIds(
  userId: string,
): Promise<DataResult<string[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("favorites")
    .select("tuition_id")
    .eq("user_id", userId)
    .not("tuition_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) return fail(error.message);
  return ok((data ?? []).map((f) => f.tuition_id as string));
}
