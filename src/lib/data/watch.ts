import "server-only";
import { getDb, ok, fail, type DataResult } from "@/lib/data/client";
import { type WatchRequest } from "@/types/index";

export async function listWatchRequests(
  userId: string,
): Promise<DataResult<WatchRequest[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("watch_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return fail(error.message);
  return ok((data ?? []) as WatchRequest[]);
}
