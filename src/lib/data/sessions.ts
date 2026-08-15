import "server-only";
import { getDb, ok, fail, type DataResult } from "@/lib/data/client";
import { getTuitionsByIds } from "@/lib/data/tuitions";
import { type Session } from "@/types/index";

export type SessionDisplay = {
  session: Session;
  tuitionTitle: string | null;
};

export async function listSessionsForTeacher(
  teacherId: string,
): Promise<DataResult<Session[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("sessions")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("scheduled_at", { ascending: true });
  if (error) return fail(error.message);
  return ok((data ?? []) as Session[]);
}

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

export async function loadSessionDisplay(
  sessions: Session[],
): Promise<SessionDisplay[]> {
  if (sessions.length === 0) return [];
  const ids = Array.from(new Set(sessions.map((s) => s.tuition_id)));
  const tuitions = (await getTuitionsByIds(ids)).data ?? [];
  const map = new Map(tuitions.map((t) => [t.id, t.title]));
  return sessions.map((session) => ({
    session,
    tuitionTitle: map.get(session.tuition_id) ?? null,
  }));
}
