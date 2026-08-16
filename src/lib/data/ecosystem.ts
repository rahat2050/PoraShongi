import "server-only";
import { getDb, getPublicDb, ok, fail, type DataResult } from "@/lib/data/client";
import { type CoachingCenter, type EducationResource } from "@/types/index";

export async function listCoachingCenters(
  district?: string,
): Promise<DataResult<CoachingCenter[]>> {
  const db = getPublicDb(300);
  if (!db) return fail("Supabase is not configured.");

  let query = db
    .from("coaching_centers")
    .select("id,owner_id,name,description,district,area,contact,website,verified,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (district) query = query.eq("district", district);

  const { data, error } = await query;
  if (error) return fail(error.message);
  return ok((data ?? []) as CoachingCenter[]);
}

export async function listEducationResources(
  subject?: string,
): Promise<DataResult<EducationResource[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  let query = db
    .from("education_resources")
    .select("id,uploader_id,title,description,resource_url,subject,class_level,price,created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (subject) query = query.eq("subject", subject);

  const { data, error } = await query;
  if (error) return fail(error.message);
  return ok((data ?? []) as EducationResource[]);
}

export async function listCoachingCourses(
  centerId: string,
): Promise<DataResult<{ id: string; title: string; description: string | null; price: number | null }[]>> {
  const db = getPublicDb(300);
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("coaching_courses")
    .select("id,title,description,price")
    .eq("center_id", centerId)
    .limit(30);
  if (error) return fail(error.message);
  return ok((data ?? []) as { id: string; title: string; description: string | null; price: number | null }[]);
}
