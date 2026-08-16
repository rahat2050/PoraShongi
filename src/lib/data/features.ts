import "server-only";
import { asJson, getDb, ok, fail, type DataResult } from "@/lib/data/client";
import {
  type AdminAnalytics,
  type BlogPost,
  type LeaderboardTeacher,
  type TeacherPublic,
  type TrialRequest,
} from "@/types/index";

export async function topTeachers(
  district?: string,
  limit = 10,
): Promise<DataResult<LeaderboardTeacher[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db.rpc("top_teachers", {
    p_district: district || null,
    p_limit: limit,
  });
  if (error) return fail(error.message);
  return ok(asJson<LeaderboardTeacher[]>(data));
}

export async function recommendTeachers(
  teacherId: string,
  limit = 4,
): Promise<DataResult<TeacherPublic[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db.rpc("recommend_teachers", {
    p_teacher_id: teacherId,
    p_limit: limit,
  });
  if (error) return fail(error.message);
  return ok(asJson<TeacherPublic[]>(data));
}

export async function adminAnalytics(): Promise<DataResult<AdminAnalytics>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db.rpc("admin_analytics");
  if (error) return fail(error.message);
  return ok(asJson<AdminAnalytics>(data));
}

export async function listBlogPosts(limit = 20): Promise<DataResult<BlogPost[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("blog_posts")
    .select("id,author_id,title,slug,excerpt,category,published,created_at")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return fail(error.message);
  return ok((data ?? []) as BlogPost[]);
}

export async function getBlogPost(slug: string): Promise<DataResult<BlogPost | null>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) return fail(error.message);
  return ok((data as BlogPost | null) ?? null);
}

export async function listTrialRequests(
  teacherId: string,
): Promise<DataResult<TrialRequest[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("trial_requests")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return fail(error.message);
  return ok((data ?? []) as TrialRequest[]);
}
