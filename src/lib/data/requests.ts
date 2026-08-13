import "server-only";
import { getDb, ok, fail, type DataResult } from "@/lib/data/client";
import { getTuitionsByIds } from "@/lib/data/tuitions";
import { getProfilesPublic, type ProfilePublic } from "@/lib/data/profiles";
import { type Tuition, type TuitionRequest } from "@/types/index";

/** Requests sent by a profile (as sender) or on behalf of a linked student. */
export async function listSentRequests(
  profileId: string,
  linkedStudentId?: string | null,
): Promise<DataResult<TuitionRequest[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  let query = db
    .from("tuition_requests")
    .select("*")
    .eq("sender_id", profileId);

  if (linkedStudentId) {
    query = db
      .from("tuition_requests")
      .select("*")
      .or(`sender_id.eq.${profileId},student_id.eq.${linkedStudentId}`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) return fail(error.message);
  return ok((data ?? []) as TuitionRequest[]);
}

/** Requests received by a teacher. */
export async function listReceivedRequests(
  teacherId: string,
): Promise<DataResult<TuitionRequest[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("tuition_requests")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });
  if (error) return fail(error.message);
  return ok((data ?? []) as TuitionRequest[]);
}

/** Tuitions that a teacher has an accepted request on (their active tuitions). */
export async function listAcceptedTuitionIds(
  teacherId: string,
): Promise<DataResult<string[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("tuition_requests")
    .select("tuition_id")
    .eq("teacher_id", teacherId)
    .eq("status", "accepted");
  if (error) return fail(error.message);
  return ok((data ?? []).map((r: { tuition_id: string }) => r.tuition_id));
}

export interface RequestDisplayRow {
  request: TuitionRequest;
  tuition: Tuition | null;
  otherName: string | null;
  otherAvatar: string | null;
  otherRole: string | null;
}

/**
 * Resolve a list of requests into display rows with the related tuition title
 * and the "other party" (teacher for sent requests, sender for received).
 */
export async function loadRequestDisplay(
  requests: TuitionRequest[],
  direction: "sent" | "received",
): Promise<RequestDisplayRow[]> {
  if (requests.length === 0) return [];

  const tuitionIds = Array.from(new Set(requests.map((r) => r.tuition_id)));
  const otherIds = Array.from(
    new Set(
      requests.map((r) => (direction === "sent" ? r.teacher_id : r.sender_id)),
    ),
  );

  const [tuitionsResult, profilesResult] = await Promise.all([
    getTuitionsByIds(tuitionIds),
    getProfilesPublic(otherIds),
  ]);

  const tuitionMap = new Map(
    (tuitionsResult.data ?? []).map((t) => [t.id, t]),
  );
  const profileMap = new Map<string, ProfilePublic>(
    (profilesResult.data ?? []).map((p) => [p.id, p]),
  );

  return requests.map((request) => {
    const otherId =
      direction === "sent" ? request.teacher_id : request.sender_id;
    const other = profileMap.get(otherId);
    return {
      request,
      tuition: tuitionMap.get(request.tuition_id) ?? null,
      otherName: other
        ? other.display_name || other.full_name || "Member"
        : null,
      otherAvatar: other?.avatar_url ?? null,
      otherRole: other?.role ?? null,
    };
  });
}
