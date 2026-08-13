import "server-only";
import { getDb, ok, fail, type DataResult } from "@/lib/data/client";
import { type UserRole } from "@/lib/auth/roles";
import {
  type Profile,
  type Report,
  type Review,
  type Tuition,
  type TuitionRequest,
} from "@/types/index";

export interface AdminStats {
  users: number;
  teachers: number;
  students: number;
  guardians: number;
  tuitions: number;
  requests: number;
  pendingVerifications: number;
}

export async function adminStats(): Promise<DataResult<AdminStats>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const counts = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("profiles").select("id", { count: "exact", head: true }).eq("role", "teacher"),
    db.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    db.from("profiles").select("id", { count: "exact", head: true }).eq("role", "guardian"),
    db.from("tuitions").select("id", { count: "exact", head: true }),
    db.from("tuition_requests").select("id", { count: "exact", head: true }),
    db
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "teacher")
      .eq("verification_status", "pending"),
  ]);

  return ok({
    users: counts[0].count ?? 0,
    teachers: counts[1].count ?? 0,
    students: counts[2].count ?? 0,
    guardians: counts[3].count ?? 0,
    tuitions: counts[4].count ?? 0,
    requests: counts[5].count ?? 0,
    pendingVerifications: counts[6].count ?? 0,
  });
}

export interface Paged<T> {
  rows: T[];
  total: number;
}

export async function adminListProfiles(
  role: UserRole | undefined,
  page: number,
  pageSize: number,
): Promise<DataResult<Paged<Profile>>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const base = db.from("profiles").select("*", { count: "exact" });

  const query = role ? base.eq("role", role) : base;
  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return fail(error.message);
  return ok({ rows: (data ?? []) as Profile[], total: count ?? 0 });
}

export async function adminListTuitions(
  page: number,
  pageSize: number,
): Promise<DataResult<Paged<Tuition>>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await db
    .from("tuitions")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return fail(error.message);
  return ok({ rows: (data ?? []) as Tuition[], total: count ?? 0 });
}

export async function adminListRequests(
  page: number,
  pageSize: number,
): Promise<DataResult<Paged<TuitionRequest>>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await db
    .from("tuition_requests")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return fail(error.message);
  return ok({ rows: (data ?? []) as TuitionRequest[], total: count ?? 0 });
}

export async function adminListTeachers(
  page: number,
  pageSize: number,
): Promise<DataResult<Paged<Profile>>> {
  return adminListProfiles("teacher", page, pageSize);
}

export async function adminListPendingVerifications(
  page: number,
  pageSize: number,
): Promise<DataResult<Paged<Profile>>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await db
    .from("profiles")
    .select("*", { count: "exact" })
    .eq("role", "teacher")
    .eq("verification_status", "pending")
    .order("created_at", { ascending: true })
    .range(from, to);

  if (error) return fail(error.message);
  return ok({ rows: (data ?? []) as Profile[], total: count ?? 0 });
}

export async function adminListReports(
  page: number,
  pageSize: number,
  status?: Report["status"],
): Promise<DataResult<Paged<Report>>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = db.from("reports").select("*", { count: "exact" });
  if (status) query = query.eq("status", status);

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return fail(error.message);
  return ok({ rows: (data ?? []) as Report[], total: count ?? 0 });
}

export async function adminListReviews(
  page: number,
  pageSize: number,
): Promise<DataResult<Paged<Review>>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await db
    .from("reviews")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return fail(error.message);
  return ok({ rows: (data ?? []) as Review[], total: count ?? 0 });
}

export async function adminReportStats(): Promise<
  DataResult<{ open: number; investigating: number }>
> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const [open, investigating] = await Promise.all([
    db.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
    db.from("reports").select("id", { count: "exact", head: true }).eq("status", "investigating"),
  ]);

  return ok({ open: open.count ?? 0, investigating: investigating.count ?? 0 });
}
