import "server-only";
import { asJson, getDb, ok, fail, type DataResult } from "@/lib/data/client";
import {
  type GuardianProfile,
  type Profile,
  type RoleProfile,
  type StudentOption,
  type StudentProfile,
  type TeacherProfile,
} from "@/types/index";

export async function listStudents(): Promise<DataResult<StudentOption[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db.rpc("list_students");
  if (error) return fail(error.message);
  return ok(asJson<StudentOption[]>(data));
}

export async function getRoleProfileRow(
  profile: Profile,
): Promise<DataResult<RoleProfile | null>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");

  const table =
    profile.role === "teacher"
      ? "teacher_profiles"
      : profile.role === "guardian"
        ? "guardian_profiles"
        : "student_profiles";

  const { data, error } = await db
    .from(table as "student_profiles")
    .select("*")
    .eq("id", profile.id)
    .maybeSingle();
  if (error) return fail(error.message);
  return ok((data as RoleProfile | null) ?? null);
}

export interface ProfileCompletion {
  percent: number;
  missing: string[];
}

export function computeProfileCompletion(
  profile: Profile,
  roleProfile: RoleProfile | null,
): ProfileCompletion {
  const missing: string[] = [];

  if (!profile.full_name) missing.push("পুরো নাম");
  if (!profile.avatar_url) missing.push("প্রোফাইল ছবি");
  if (!profile.district) missing.push("জেলা");
  if (!profile.area) missing.push("এলাকা");

  switch (profile.role) {
    case "teacher": {
      const tp = roleProfile as TeacherProfile | null;
      if (!tp?.education) missing.push("শিক্ষাগত যোগ্যতা");
      if (!tp?.subjects || tp.subjects.length === 0) missing.push("বিষয়");
      if (!tp?.classes_taught || tp.classes_taught.length === 0) missing.push("ক্লাস");
      if (tp?.experience_years === null || tp?.experience_years === undefined) missing.push("অভিজ্ঞতা");
      if (tp?.expected_salary === null || tp?.expected_salary === undefined) missing.push("বেতন");
      if (!tp?.teaching_mode) missing.push("মোড");
      if (!tp?.available_days || tp.available_days.length === 0) missing.push("সময়");
      if (!tp?.bio) missing.push("বায়ো");
      break;
    }
    case "student": {
      const sp = roleProfile as StudentProfile | null;
      if (!sp?.grade) missing.push("ক্লাস");
      if (!sp?.institution) missing.push("শিক্ষাপ্রতিষ্ঠান");
      if (!sp?.teaching_mode_preference) missing.push("মোড পছন্দ");
      break;
    }
    case "guardian": {
      const gp = roleProfile as GuardianProfile | null;
      if (!gp?.relationship_to_student) missing.push("সম্পর্ক");
      if (!gp?.contact_preference) missing.push("যোগাযোগ মাধ্যম");
      if (!gp?.linked_student_id) missing.push("লিংকড শিক্ষার্থী");
      break;
    }
    default:
      break;
  }

  const roleItemCount =
    profile.role === "teacher" ? 8 : profile.role === "student" ? 3 : 3;
  const totalItems = 4 + roleItemCount;
  const completed = totalItems - missing.length;
  const percent = Math.max(0, Math.min(100, Math.round((completed / totalItems) * 100)));

  return { percent, missing };
}

export type { GuardianProfile };
