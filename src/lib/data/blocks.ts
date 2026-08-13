import "server-only";
import { getDb, ok, fail, type DataResult } from "@/lib/data/client";

export async function isBlocked(
  userId: string,
  otherId: string,
): Promise<DataResult<boolean>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const { data, error } = await db
    .from("blocks")
    .select("id")
    .or(
      `and(blocker_id.eq.${userId},blocked_id.eq.${otherId}),and(blocker_id.eq.${otherId},blocked_id.eq.${userId})`,
    )
    .limit(1);
  if (error) return fail(error.message);
  return ok((data?.length ?? 0) > 0);
}

export async function listBlockedIds(
  userId: string,
): Promise<DataResult<string[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("blocks")
    .select("blocked_id")
    .eq("blocker_id", userId);
  if (error) return fail(error.message);
  return ok((data ?? []).map((b: { blocked_id: string }) => b.blocked_id));
}
