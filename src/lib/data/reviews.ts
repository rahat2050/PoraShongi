import "server-only";
import { asJson, getDb, ok, fail, type DataResult } from "@/lib/data/client";
import {
  type Review,
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

export async function getOwnReview(
  userId: string,
  teacherId: string,
): Promise<DataResult<Review | null>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("reviews")
    .select("*")
    .eq("reviewer_id", userId)
    .eq("teacher_id", teacherId)
    .maybeSingle();
  if (error) return fail(error.message);
  return ok(data ?? null);
}

export async function getAcceptedTuitionId(
  userId: string,
  teacherId: string,
): Promise<DataResult<string | null>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("tuition_requests")
    .select("tuition_id")
    .eq("teacher_id", teacherId)
    .eq("status", "accepted")
    .or(`sender_id.eq.${userId},student_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return fail(error.message);
  return ok(data?.tuition_id ?? null);
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
