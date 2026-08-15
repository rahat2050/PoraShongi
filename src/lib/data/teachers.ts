import "server-only";
import { asJson, getDb, ok, fail, type DataResult } from "@/lib/data/client";
import {
  type SearchResponse,
  type TeacherDetail,
  type TeacherMatch,
  type TeacherPublic,
} from "@/types/index";

export interface TeacherSearchFilters {
  classLevel?: string;
  subject?: string;
  district?: string;
  area?: string;
  lat?: number;
  lon?: number;
  maxDistanceKm?: number;
  mode?: string;
  gender?: string;
  minExperience?: number;
  minRating?: number;
  verified?: boolean;
  sort?: "relevance" | "nearest" | "rating" | "experience" | "newest";
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
    p_district: filters.district || null,
    p_area: filters.area || null,
    p_lat: filters.lat ?? null,
    p_lon: filters.lon ?? null,
    p_max_distance_km: filters.maxDistanceKm ?? null,
    p_mode: filters.mode || null,
    p_gender: filters.gender || null,
    p_min_experience: filters.minExperience ?? null,
    p_min_rating: filters.minRating ?? null,
    p_verified: filters.verified ?? null,
    p_sort: filters.sort || "relevance",
    p_page: filters.page,
    p_page_size: filters.pageSize,
  });

  if (error) return fail(error.message);
  return ok(asJson<SearchResponse<TeacherPublic>>(data));
}

export async function getPublicTeacher(
  teacherId: string,
): Promise<DataResult<TeacherDetail | null>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const { data, error } = await db.rpc("get_public_teacher", {
    p_teacher_id: teacherId,
  });
  if (error) return fail(error.message);
  return ok(asJson<TeacherDetail | null>(data));
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
