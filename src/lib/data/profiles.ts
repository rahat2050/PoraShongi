import "server-only";
import { asJson, getDb, ok, fail, type DataResult } from "@/lib/data/client";
import {
  type GuardianProfile,
  type Profile,
  type RoleProfile,
  type StudentProfile,
  type TeacherProfile,
} from "@/types/index";

/** Minimal public student row used for guardian linking. */
export type StudentOption = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  location: string | null;
};

/** Minimal public profile row used for names in lists. */
export type ProfilePublic = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  role: string;
  avatar_url: string | null;
  location: string | null;
};

export async function listStudents(): Promise<DataResult<StudentOption[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db.rpc("list_students");
  if (error) return fail(error.message);
  return ok(asJson<StudentOption[]>(data));
}

export async function getProfilesPublic(
  ids: string[],
): Promise<DataResult<ProfilePublic[]>> {
  const db = await getDb();
  if (!db) return fail("Supabase is not configured.");
  if (ids.length === 0) return ok([]);
  const { data, error } = await db.rpc("get_profiles_public", { p_ids: ids });
  if (error) return fail(error.message);
  return ok(asJson<ProfilePublic[]>(data));
}

/** Fetch the role-specific profile row for a base profile. */
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

/** Compute a profile-completion percentage and a list of missing items. */
export function computeProfileCompletion(
  profile: Profile,
  roleProfile: RoleProfile | null,
): ProfileCompletion {
  const missing: string[] = [];

  // Base profile — 40%
  if (!profile.full_name) missing.push("Full name");
  if (!profile.avatar_url) missing.push("Profile picture");
  if (!profile.location) missing.push("Location");
  if (!profile.phone) missing.push("Phone number");

  // Role-specific — 60%
  switch (profile.role) {
    case "teacher": {
      const tp = roleProfile as TeacherProfile | null;
      if (!tp?.education) missing.push("Education");
      if (!tp?.institution) missing.push("Institution");
      if (!tp?.subjects || tp.subjects.length === 0) missing.push("Subjects");
      if (!tp?.classes_taught || tp.classes_taught.length === 0)
        missing.push("Classes taught");
      if (!tp?.experience_years && tp?.experience_years !== 0)
        missing.push("Experience");
      if (tp?.expected_salary === null || tp?.expected_salary === undefined)
        missing.push("Expected salary");
      if (!tp?.teaching_mode) missing.push("Teaching mode");
      if (!tp?.available_days || tp.available_days.length === 0)
        missing.push("Available days");
      if (!tp?.bio) missing.push("Bio");
      break;
    }
    case "student": {
      const sp = roleProfile as StudentProfile | null;
      if (!sp?.grade) missing.push("Class");
      if (!sp?.institution) missing.push("Institution");
      if (!sp?.subjects_of_interest || sp.subjects_of_interest.length === 0)
        missing.push("Subjects of interest");
      if (!sp?.teaching_mode_preference) missing.push("Teaching mode preference");
      break;
    }
    case "guardian": {
      const gp = roleProfile as GuardianProfile | null;
      if (!gp?.relationship_to_student) missing.push("Relationship to student");
      if (!gp?.contact_preference) missing.push("Contact preference");
      if (!gp?.linked_student_id) missing.push("Linked student");
      break;
    }
    default:
      break;
  }

  const baseChecks = 4;
  const roleItemCount =
    profile.role === "teacher" ? 9 : profile.role === "student" ? 4 : 3;
  const totalItems = baseChecks + roleItemCount;
  const completedItems = totalItems - missing.length;
  const percent = Math.max(
    0,
    Math.min(100, Math.round((completedItems / totalItems) * 100)),
  );

  return { percent, missing };
}
