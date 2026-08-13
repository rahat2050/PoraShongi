import "server-only";
import { asJson, getDb, ok, fail, type DataResult } from "@/lib/data/client";
import {
  type SearchResponse,
  type TeacherMatch,
  type TeacherPublic,
  type TeacherReputation,
  type ReviewPublic,
  type OwnReview,
} from "@/types/index";

export interface TeacherSearchFilters {
  classLevel?: string;
  subject?: string;
  location?: string;
  minExperience?: number;
  mode?: string;
  verified?: boolean;
  sort?: "relevance" | "best_match" | "rating" | "experience" | "newest";
  gender?: string;
  minRating?: number;
  availableDay?: string;
  tuitionId?: string;
  page: number;
  pageSize: number;
}

export async function searchTeachers(
  filters: TeacherSearchFilters,
): Promise<DataResult<SearchResponse<TeacherPublic>>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const { data, error } = await db.rpc("search_teachers", {
    p_class: filters.classLevel || null,
    p_subject: filters.subject || null,
    p_location: filters.location || null,
    p_min_experience: filters.minExperience ?? null,
    p_mode: filters.mode || null,
    p_verified: filters.verified ?? null,
    p_sort: filters.sort || "relevance",
    p_gender: filters.gender || null,
    p_min_rating: filters.minRating ?? null,
    p_available_day: filters.availableDay || null,
    p_tuition_id: filters.tuitionId || null,
    p_page: filters.page,
    p_page_size: filters.pageSize,
  });

  if (error) return fail(error.message);
  return ok(asJson<SearchResponse<TeacherPublic>>(data));
}

export async function getPublicTeacher(
  teacherId: string,
): Promise<DataResult<TeacherPublic | null>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const { data, error } = await db.rpc("get_public_teacher", {
    p_teacher_id: teacherId,
  });
  if (error) return fail(error.message);

  return ok(asJson<TeacherPublic | null>(data));
}

export async function getPublicTeachers(
  teacherIds: string[],
): Promise<DataResult<TeacherPublic[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  if (teacherIds.length === 0) return ok([]);

  const { data, error } = await db.rpc("get_public_teachers", {
    p_ids: teacherIds,
  });
  if (error) return fail(error.message);
  return ok(asJson<TeacherPublic[]>(data));
}

/** Smart matching — explainable best-match list for a tuition. */
export async function matchTeachersForTuition(
  tuitionId: string,
  limit = 10,
): Promise<DataResult<{ total: number; results: TeacherMatch[] }>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const { data, error } = await db.rpc("match_teachers_for_tuition", {
    p_tuition_id: tuitionId,
    p_limit: limit,
  });
  if (error) return fail(error.message);
  return ok(asJson<{ total: number; results: TeacherMatch[] }>(data));
}

export async function getTeacherReputation(
  teacherId: string,
): Promise<DataResult<TeacherReputation | null>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const { data, error } = await db.rpc("get_teacher_reputation", {
    p_teacher_id: teacherId,
  });
  if (error) return fail(error.message);
  return ok(asJson<TeacherReputation | null>(data));
}

export async function getTeacherReviews(
  teacherId: string,
  page: number,
  pageSize = 10,
): Promise<DataResult<SearchResponse<ReviewPublic>>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const { data, error } = await db.rpc("get_teacher_reviews", {
    p_teacher_id: teacherId,
    p_page: page,
    p_page_size: pageSize,
  });
  if (error) return fail(error.message);
  return ok(asJson<SearchResponse<ReviewPublic>>(data));
}

export async function getTeacherOwnReviews(
  teacherId: string,
): Promise<DataResult<OwnReview[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const { data, error } = await db.rpc("get_teacher_own_reviews", {
    p_teacher_id: teacherId,
  });
  if (error) return fail(error.message);
  return ok(asJson<OwnReview[]>(data));
}
