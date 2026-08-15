import "server-only";
import { getDb, ok, fail, type DataResult } from "@/lib/data/client";
import { getProfilesPublic } from "@/lib/data/profiles-public";
import { type ProfilePublic } from "@/types/index";

/** Teacher-এর accepted tuition থেকে student তালিকা (আমার student)। */
export async function listMyStudents(
  teacherId: string,
): Promise<DataResult<ProfilePublic[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  // accepted request-এ যারা student_id আছে
  const { data, error } = await db
    .from("tuition_requests")
    .select("student_id")
    .eq("teacher_id", teacherId)
    .eq("status", "accepted")
    .not("student_id", "is", null)
    .limit(50);

  if (error) return fail(error.message);

  const ids = Array.from(
    new Set((data ?? []).map((r) => r.student_id as string).filter(Boolean)),
  );
  if (ids.length === 0) return ok([]);

  return getProfilesPublic(ids);
}
