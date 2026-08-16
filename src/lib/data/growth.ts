import "server-only";
import { getDb, ok, fail, type DataResult } from "@/lib/data/client";

export interface TeacherAnalytics {
  profile_views: number;
  total_requests: number;
  accepted_requests: number;
  acceptance_rate: number;
  favorites: number;
  rating_avg: number;
  review_count: number;
}

/** Teacher-এর নিজের analytics — সব existing data থেকে, নতুন write ছাড়া। */
export async function getTeacherAnalytics(
  teacherId: string,
): Promise<DataResult<TeacherAnalytics>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const [tp, reqCount, accCount, favCount] = await Promise.all([
    db.from("teacher_profiles").select("profile_views,rating_avg,review_count").eq("id", teacherId).maybeSingle(),
    db.from("tuition_requests").select("id", { count: "exact", head: true }).eq("teacher_id", teacherId),
    db.from("tuition_requests").select("id", { count: "exact", head: true }).eq("teacher_id", teacherId).eq("status", "accepted"),
    db.from("favorites").select("id", { count: "exact", head: true }).eq("teacher_id", teacherId),
  ]);

  const total = reqCount.count ?? 0;
  const accepted = accCount.count ?? 0;

  // acceptance rate: accepted / total responded (accepted+rejected)
  const rejectedCountRes = await db
    .from("tuition_requests")
    .select("id", { count: "exact", head: true })
    .eq("teacher_id", teacherId)
    .eq("status", "rejected");
  const rejected = rejectedCountRes.count ?? 0;
  const respondedTotal = accepted + rejected;
  const acceptanceRate = respondedTotal > 0 ? Math.round((accepted / respondedTotal) * 100) : 0;

  return ok({
    profile_views: tp.data?.profile_views ?? 0,
    total_requests: total,
    accepted_requests: accepted,
    acceptance_rate: acceptanceRate,
    favorites: favCount.count ?? 0,
    rating_avg: tp.data?.rating_avg ?? 0,
    review_count: tp.data?.review_count ?? 0,
  });
}

export interface ReferralInfo {
  code: string | null;
  count: number;
}

export async function getReferralInfo(
  userId: string,
): Promise<DataResult<ReferralInfo>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const [profile, refs] = await Promise.all([
    db.from("profiles").select("referral_code").eq("id", userId).maybeSingle(),
    db.from("referrals").select("id", { count: "exact", head: true }).eq("referrer_id", userId),
  ]);

  return ok({
    code: (profile.data?.referral_code as string | null) ?? null,
    count: refs.count ?? 0,
  });
}
