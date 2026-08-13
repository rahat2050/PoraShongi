import "server-only";
import { asJson, getDb, ok, fail, type DataResult } from "@/lib/data/client";
import {
  type SearchResponse,
  type Tuition,
  type TuitionPublic,
} from "@/types/index";

export interface TuitionSearchFilters {
  classLevel?: string;
  subject?: string;
  location?: string;
  minBudget?: number;
  maxBudget?: number;
  mode?: string;
  day?: string;
  time?: string;
  page: number;
  pageSize: number;
}

export async function searchTuitions(
  filters: TuitionSearchFilters,
): Promise<DataResult<SearchResponse<TuitionPublic>>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const { data, error } = await db.rpc("search_tuitions", {
    p_class: filters.classLevel || null,
    p_subject: filters.subject || null,
    p_location: filters.location || null,
    p_min_budget: filters.minBudget ?? null,
    p_max_budget: filters.maxBudget ?? null,
    p_mode: filters.mode || null,
    p_day: filters.day || null,
    p_time: filters.time || null,
    p_page: filters.page,
    p_page_size: filters.pageSize,
  });

  if (error) return fail(error.message);
  return ok(asJson<SearchResponse<TuitionPublic>>(data));
}

export async function getPublicTuition(
  tuitionId: string,
): Promise<DataResult<TuitionPublic | null>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const { data, error } = await db.rpc("get_public_tuition", {
    p_tuition_id: tuitionId,
  });
  if (error) return fail(error.message);
  return ok(asJson<TuitionPublic | null>(data));
}

/** Tuitions owned by a profile (poster) or linked to a student. */
export async function listTuitionsFor(
  profileId: string,
  linkedStudentId?: string | null,
): Promise<DataResult<Tuition[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  let query = db
    .from("tuitions")
    .select("*")
    .eq("poster_id", profileId);

  if (linkedStudentId) {
    query = db
      .from("tuitions")
      .select("*")
      .or(`poster_id.eq.${profileId},student_id.eq.${linkedStudentId}`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) return fail(error.message);
  return ok((data ?? []) as Tuition[]);
}

/** Fetch multiple tuitions by id (visible to authenticated users). */
export async function getTuitionsByIds(
  ids: string[],
): Promise<DataResult<Tuition[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  if (ids.length === 0) return ok([]);

  const { data, error } = await db
    .from("tuitions")
    .select("*")
    .in("id", ids);
  if (error) return fail(error.message);
  return ok((data ?? []) as Tuition[]);
}

/** A single tuition owned by (or visible to) the current user. */
export async function getTuitionById(
  tuitionId: string,
): Promise<DataResult<Tuition | null>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const { data, error } = await db
    .from("tuitions")
    .select("*")
    .eq("id", tuitionId)
    .maybeSingle();
  if (error) return fail(error.message);
  return ok((data as Tuition | null) ?? null);
}
