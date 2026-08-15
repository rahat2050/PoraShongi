import "server-only";
import { asJson, getDb, ok, fail, type DataResult } from "@/lib/data/client";
import {
  type ReviewPublic,
  type SearchResponse,
  type TeacherReputation,
} from "@/types/index";

export async function getTeacherReputation(
  teacherId: string,
): Promise<DataResult<TeacherReputation | null>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db.rpc("get_teacher_reputation", { p_teacher_id: teacherId });
  if (error) return fail(error.message);
  return ok(asJson<TeacherReputation | null>(data));
}

export async function getTeacherReviews(
  teacherId: string,
  page = 1,
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

export async function hasReviewed(
  userId: string,
  teacherId: string,
): Promise<DataResult<boolean>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("reviews")
    .select("id")
    .eq("reviewer_id", userId)
    .eq("teacher_id", teacherId)
    .maybeSingle();
  if (error) return fail(error.message);
  return ok(Boolean(data));
}

export async function hasAcceptedInteraction(
  userId: string,
  teacherId: string,
): Promise<DataResult<boolean>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("tuition_requests")
    .select("id")
    .eq("teacher_id", teacherId)
    .eq("status", "accepted")
    .or(`sender_id.eq.${userId},student_id.eq.${userId}`)
    .limit(1);
  if (error) return fail(error.message);
  return ok((data?.length ?? 0) > 0);
}

export async function isBlocked(
  userId: string,
  otherId: string,
): Promise<DataResult<boolean>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("blocks")
    .select("id")
    .or(`and(blocker_id.eq.${userId},blocked_id.eq.${otherId}),and(blocker_id.eq.${otherId},blocked_id.eq.${userId})`)
    .limit(1);
  if (error) return fail(error.message);
  return ok((data?.length ?? 0) > 0);
}
