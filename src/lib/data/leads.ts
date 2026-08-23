import "server-only";
import { asJson, getDb, getPublicDb, ok, fail, type DataResult } from "@/lib/data/client";
import { type TutorLead, type TutorLeadStats, type TutorLeadStatus } from "@/types/index";

/** Admin inbox for public "শিক্ষক চাই" requests. */
export async function listTutorLeads(
  status?: TutorLeadStatus,
  limit = 50,
): Promise<DataResult<TutorLead[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db.rpc("admin_list_tutor_leads", {
    p_status: status ?? null,
    p_limit: limit,
  });
  if (error) return fail(error.message);
  return ok(asJson<TutorLead[]>(data) ?? []);
}

/** Aggregate counts only — no personal data, safe for the public homepage. */
export async function tutorLeadStats(): Promise<DataResult<TutorLeadStats>> {
  const db = getPublicDb(300);
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db.rpc("tutor_lead_stats");
  if (error) return fail(error.message);
  return ok(asJson<TutorLeadStats>(data));
}
