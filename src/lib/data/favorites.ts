import "server-only";
import { getDb, ok, fail, type DataResult } from "@/lib/data/client";
import { type Favorite } from "@/types/index";

export async function listFavoriteIds(
  userId: string,
): Promise<DataResult<string[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("favorites")
    .select("teacher_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return fail(error.message);
  return ok((data ?? []).map((f: { teacher_id: string }) => f.teacher_id));
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

/** Internal — used by actions only. */
export type FavoriteRow = Favorite;
