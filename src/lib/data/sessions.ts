import "server-only";
import { getDb, ok, fail, type DataResult } from "@/lib/data/client";
import { type Session } from "@/types/index";

export type SessionDisplay = {
  session: Session;
  tuitionTitle: string | null;
  otherName: string | null;
};

/** All sessions where the user is the teacher. */
export async function listSessionsForUser(
  userId: string,
): Promise<DataResult<Session[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const { data, error } = await db
    .from("sessions")
    .select("*")
    .eq("teacher_id", userId)
    .order("scheduled_at", { ascending: true });
  if (error) return fail(error.message);
  return ok((data ?? []) as Session[]);
}

/** Sessions for the tuitions a student/guardian is involved with. */
export async function listSessionsByTuitions(
  tuitionIds: string[],
): Promise<DataResult<Session[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  if (tuitionIds.length === 0) return ok([]);

  const { data, error } = await db
    .from("sessions")
    .select("*")
    .in("tuition_id", tuitionIds)
    .order("scheduled_at", { ascending: true });
  if (error) return fail(error.message);
  return ok((data ?? []) as Session[]);
}

/** Upcoming sessions for a teacher. */
export async function upcomingSessionsForTeacher(
  teacherId: string,
  limit = 20,
): Promise<DataResult<Session[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const { data, error } = await db
    .from("sessions")
    .select("*")
    .eq("teacher_id", teacherId)
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(limit);
  if (error) return fail(error.message);
  return ok((data ?? []) as Session[]);
}
