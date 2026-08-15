import "server-only";
import { asJson, getDb, ok, fail, type DataResult } from "@/lib/data/client";
import { type SearchResponse, type Tuition, type TuitionPublic } from "@/types/index";

export interface TuitionSearchFilters {
  classLevel?: string;
  subject?: string;
  district?: string;
  area?: string;
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
    p_district: filters.district || null,
    p_area: filters.area || null,
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

/** poster বা linked student-এর tuition list */
export async function listTuitionsFor(
  profileId: string,
  linkedStudentId?: string | null,
): Promise<DataResult<Tuition[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const { data, error } = await db
    .from("tuitions")
    .select("*")
    .or(
      linkedStudentId
        ? `poster_id.eq.${profileId},student_id.eq.${linkedStudentId}`
        : `poster_id.eq.${profileId}`,
    )
    .order("created_at", { ascending: false });

  if (error) return fail(error.message);
  return ok((data ?? []) as Tuition[]);
}

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

export async function getTuitionsByIds(
  ids: string[],
): Promise<DataResult<Tuition[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  if (ids.length === 0) return ok([]);

  const { data, error } = await db.from("tuitions").select("*").in("id", ids);
  if (error) return fail(error.message);
  return ok((data ?? []) as Tuition[]);
}
