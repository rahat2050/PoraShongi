import "server-only";
import { getDb, ok, fail, type DataResult } from "@/lib/data/client";

export async function listFavoriteTeacherIds(
  userId: string,
): Promise<DataResult<string[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("favorites")
    .select("teacher_id")
    .eq("user_id", userId)
    .not("teacher_id", "is", null)
    .order("created_at", { ascending: false });
  if (error) return fail(error.message);
  return ok((data ?? []).map((f) => f.teacher_id as string));
}

export async function isFavorite(
  userId: string,
  teacherId: string,
): Promise<DataResult<boolean>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("teacher_id", teacherId)
    .maybeSingle();
  if (error) return fail(error.message);
  return ok(Boolean(data));
}
