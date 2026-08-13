import "server-only";
import { asJson, getDb, ok, fail, type DataResult } from "@/lib/data/client";
import {
  type SearchResponse,
  type TeacherPublic,
} from "@/types/index";

export interface TeacherSearchFilters {
  classLevel?: string;
  subject?: string;
  location?: string;
  minExperience?: number;
  mode?: string;
  verified?: boolean;
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

  const parsed = asJson<TeacherPublic | null>(data);
  return ok(parsed);
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
