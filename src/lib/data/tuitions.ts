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

export async function hasAcceptedTuitionForTeacher(
  tuitionId: string,
  teacherId: string,
): Promise<DataResult<boolean>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("tuition_requests")
    .select("id")
    .eq("tuition_id", tuitionId)
    .eq("teacher_id", teacherId)
    .eq("status", "accepted")
    .maybeSingle();
  if (error) return fail(error.message);
  return ok(Boolean(data));
}

export async function listAcceptedTuitionsForTeacher(
  teacherId: string,
): Promise<DataResult<Tuition[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const { data: requests, error } = await db
    .from("tuition_requests")
    .select("tuition_id")
    .eq("teacher_id", teacherId)
    .eq("status", "accepted")
    .limit(50);
  if (error) return fail(error.message);

  const ids = Array.from(new Set((requests ?? []).map((request) => request.tuition_id)));
  return getTuitionsByIds(ids);
}

/** poster বা linked student-এর tuition list — বড় text (requirements) বাদ, data বাঁচাতে।
 *  student_id/meeting_link সরাসরি select করা যায় না (0030 column-level RLS);
 *  প্রয়োজন হলে guarded get_public_tuition RPC ব্যবহার করুন। */
const TUITION_LIST_COLUMNS =
  "id,poster_id,title,class_level,subject,district,area,budget,budget_negotiable,teaching_mode,preferred_days,preferred_time,status,created_at,updated_at";

export async function listTuitionsFor(
  profileId: string,
  linkedStudentId?: string | null,
): Promise<DataResult<Tuition[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const { data, error } = await db
    .from("tuitions")
    .select(TUITION_LIST_COLUMNS)
    .or(
      linkedStudentId
        ? `poster_id.eq.${profileId},student_id.eq.${linkedStudentId}`
        : `poster_id.eq.${profileId}`,
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return fail(error.message);
  return ok((data ?? []) as Tuition[]);
}

export async function getTuitionById(
  tuitionId: string,
): Promise<DataResult<Tuition | null>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  // meeting_link/student_id সরাসরি select করা যায় না (0030) — owner হলে
  // detail page-এ guarded get_public_tuition RPC সেগুলো দেয়।
  const { data, error } = await db
    .from("tuitions")
    .select("id,poster_id,title,class_level,subject,district,area,budget,budget_negotiable,teaching_mode,preferred_days,preferred_time,requirements,is_featured,featured_until,is_batch,batch_size,seats_filled,status,created_at,updated_at")
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

  // শুধু title/class/subject দরকার (request/session display-তে) — data বাঁচাতে
  const { data, error } = await db
    .from("tuitions")
    .select("id,title,class_level,subject,status")
    .in("id", ids);
  if (error) return fail(error.message);
  return ok((data ?? []) as Tuition[]);
}
