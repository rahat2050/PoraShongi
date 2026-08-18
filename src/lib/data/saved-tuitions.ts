import "server-only";
import { getDb, ok, fail, type DataResult } from "@/lib/data/client";
import { getProfilesPublic } from "@/lib/data/profiles-public";
import { type TuitionPublic } from "@/types/index";

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
  return ok((data ?? []).map((favorite) => favorite.tuition_id as string));
}

/**
 * Loads saved tuition cards without duplicating tuition/profile data in a new
 * table. Only the tiny favorites pointer is stored; current card data is read
 * live and returned in the same order the teacher saved it.
 */
export async function listSavedTuitions(
  userId: string,
  limit = 30,
): Promise<DataResult<TuitionPublic[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const safeLimit = Math.max(1, Math.min(50, Math.floor(limit)));
  const { data: favorites, error: favoriteError } = await db
    .from("favorites")
    .select("tuition_id,created_at")
    .eq("user_id", userId)
    .not("tuition_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(safeLimit);
  if (favoriteError) return fail(favoriteError.message);

  const tuitionIds = (favorites ?? [])
    .map((favorite) => favorite.tuition_id)
    .filter((id): id is string => Boolean(id));
  if (tuitionIds.length === 0) return ok([]);

  const { data: tuitions, error: tuitionError } = await db
    .from("tuitions")
    .select("id,title,class_level,subject,district,area,budget,budget_negotiable,teaching_mode,preferred_days,preferred_time,requirements,is_featured,featured_until,is_batch,batch_size,seats_filled,status,created_at,poster_id,student_id")
    .in("id", tuitionIds);
  if (tuitionError) return fail(tuitionError.message);

  const rows = tuitions ?? [];
  const profilesResult = await getProfilesPublic(Array.from(new Set(rows.map((tuition) => tuition.poster_id))));
  if (profilesResult.error) return fail(profilesResult.error);

  const profileMap = new Map((profilesResult.data ?? []).map((profile) => [profile.id, profile]));
  const tuitionMap = new Map(rows.map((tuition) => [tuition.id, tuition]));
  const result: TuitionPublic[] = [];

  for (const tuitionId of tuitionIds) {
    const tuition = tuitionMap.get(tuitionId);
    if (!tuition) continue;
    const poster = profileMap.get(tuition.poster_id);
    if (!poster) continue;
    result.push({
      ...tuition,
      poster_name: poster.full_name,
      poster_display_name: poster.display_name,
      poster_role: poster.role,
      poster_avatar: poster.avatar_url,
    });
  }

  return ok(result);
}
