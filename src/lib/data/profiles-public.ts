import "server-only";
import { asJson, getDb, ok, fail, type DataResult } from "@/lib/data/client";
import { type ProfilePublic } from "@/types/index";

export async function getProfilesPublic(
  ids: string[],
): Promise<DataResult<ProfilePublic[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  if (ids.length === 0) return ok([]);

  const { data, error } = await db.rpc("get_profiles_public", { p_ids: ids });
  if (error) return fail(error.message);
  return ok(asJson<ProfilePublic[]>(data));
}
