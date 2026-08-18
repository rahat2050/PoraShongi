import "server-only";
import { getDb, ok, fail, type DataResult } from "@/lib/data/client";
import { type UserRole } from "@/lib/auth/roles";
import { type AdminAuditLog, type Profile, type Report, type Tuition, type TuitionStatus } from "@/types/index";

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

  const base = db
    .from("profiles")
    .select("id,role,full_name,display_name,avatar_url,district,area,gender,is_minor,guardian_consent,phone_verified,education_verified,identity_verified,trusted_tutor,is_super_admin,is_premium,premium_until,account_status,verification_status,created_at,updated_at", { count: "exact" });

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
  status?: TuitionStatus,
): Promise<DataResult<Paged<Tuition>>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = db.from("tuitions").select("*", { count: "exact" });
  if (status) query = query.eq("status", status);
  const { data, count, error } = await query
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) return fail(error.message);
  return ok({ rows: (data ?? []) as Tuition[], total: count ?? 0 });
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

export async function adminListAuditLogs(limit = 30): Promise<DataResult<AdminAuditLog[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db
    .from("admin_audit_log")
    .select("id,admin_id,action,target_type,target_id,details,created_at")
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100));
  if (error) return fail(error.message);
  return ok((data ?? []) as AdminAuditLog[]);
}

export async function adminStats(): Promise<
  DataResult<{ users: number; teachers: number; students: number; guardians: number; openReports: number; openTuitions: number }>
> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const [users, teachers, students, guardians, reports, tuitions] = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("profiles").select("id", { count: "exact", head: true }).eq("role", "teacher"),
    db.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    db.from("profiles").select("id", { count: "exact", head: true }).eq("role", "guardian"),
    db.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
    db.from("tuitions").select("id", { count: "exact", head: true }).eq("status", "open"),
  ]);

  const queryError = users.error || teachers.error || students.error || guardians.error || reports.error || tuitions.error;
  if (queryError) return fail(queryError.message);

  return ok({
    users: users.count ?? 0,
    teachers: teachers.count ?? 0,
    students: students.count ?? 0,
    guardians: guardians.count ?? 0,
    openReports: reports.count ?? 0,
    openTuitions: tuitions.count ?? 0,
  });
}
