import "server-only";
import { getDb, ok, fail, type DataResult } from "@/lib/data/client";
import { getTuitionsByIds } from "@/lib/data/tuitions";
import { type ProfilePublic, type Tuition, type TuitionRequest } from "@/types/index";
import { getProfilesPublic } from "@/lib/data/profiles-public";

// message (লম্বা text) list-এ দরকার নেই — data বাঁচাতে বাদ
const REQUEST_COLUMNS = "id,tuition_id,sender_id,teacher_id,student_id,status,created_at,responded_at";

export async function listSentRequests(
  profileId: string,
  linkedStudentId?: string | null,
): Promise<DataResult<TuitionRequest[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const { data, error } = await db
    .from("tuition_requests")
    .select(REQUEST_COLUMNS)
    .or(
      linkedStudentId
        ? `sender_id.eq.${profileId},student_id.eq.${linkedStudentId}`
        : `sender_id.eq.${profileId}`,
    )
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return fail(error.message);
  return ok((data ?? []) as TuitionRequest[]);
}

export async function listReceivedRequests(
  teacherId: string,
): Promise<DataResult<TuitionRequest[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("tuition_requests")
    .select(REQUEST_COLUMNS)
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return fail(error.message);
  return ok((data ?? []) as TuitionRequest[]);
}

export interface RequestDisplayRow {
  request: TuitionRequest;
  tuition: Tuition | null;
  other: ProfilePublic | null;
}

export async function loadRequestDisplay(
  requests: TuitionRequest[],
  direction: "sent" | "received",
): Promise<RequestDisplayRow[]> {
  if (requests.length === 0) return [];

  const tuitionIds = Array.from(new Set(requests.map((r) => r.tuition_id)));
  const otherIds = Array.from(
    new Set(requests.map((r) => (direction === "sent" ? r.teacher_id : r.sender_id))),
  );

  const [tuitionsRes, profilesRes] = await Promise.all([
    getTuitionsByIds(tuitionIds),
    getProfilesPublic(otherIds),
  ]);

  const tuitionMap = new Map((tuitionsRes.data ?? []).map((t) => [t.id, t]));
  const profileMap = new Map<string, ProfilePublic>(
    (profilesRes.data ?? []).map((p) => [p.id, p]),
  );

  return requests.map((request) => {
    const otherId = direction === "sent" ? request.teacher_id : request.sender_id;
    return {
      request,
      tuition: tuitionMap.get(request.tuition_id) ?? null,
      other: profileMap.get(otherId) ?? null,
    };
  });
}
