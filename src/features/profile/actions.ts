"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/server-auth";
import {
  guardianProfileSchema,
  studentProfileSchema,
  teacherProfileSchema,
  updateProfileSchema,
} from "@/validation/profile";
import { failure, success, type ActionResult } from "@/features/types";

export async function updateBaseProfile(input: {
  fullName: string;
  displayName?: string;
  location?: string;
  phone?: string;
  avatarUrl?: string;
}): Promise<ActionResult> {
  const profile = await requireProfile();
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      display_name: parsed.data.displayName || null,
      location: parsed.data.location || null,
      phone: parsed.data.phone || null,
      avatar_url: input.avatarUrl || null,
    })
    .eq("id", profile.id);

  if (error) return failure(error.message);

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return success();
}

export async function updateStudentProfile(
  input: unknown,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (profile.role !== "student") return failure("Invalid role.");

  const parsed = studentProfileSchema.safeParse(input);
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("student_profiles")
    .update({
      grade: parsed.data.grade,
      student_group: parsed.data.studentGroup || null,
      institution: parsed.data.institution,
      subjects_of_interest: parsed.data.subjectsOfInterest ?? null,
      teaching_mode_preference: parsed.data.teachingModePreference,
      budget: parsed.data.budget,
      preferred_days: parsed.data.preferredDays ?? null,
      preferred_time: parsed.data.preferredTime,
      bio: parsed.data.bio,
    })
    .eq("id", profile.id);

  if (error) return failure(error.message);
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return success();
}

export async function updateTeacherProfile(
  input: unknown,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (profile.role !== "teacher") return failure("Invalid role.");

  const parsed = teacherProfileSchema.safeParse(input);
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("teacher_profiles")
    .update({
      headline: parsed.data.headline,
      bio: parsed.data.bio,
      education: parsed.data.education,
      institution: parsed.data.institution,
      subjects: parsed.data.subjects,
      qualifications: parsed.data.qualifications ?? null,
      classes_taught: parsed.data.classesTaught,
      experience_years: parsed.data.experienceYears,
      teaching_mode: parsed.data.teachingMode,
      teaching_area: parsed.data.teachingArea,
      expected_salary: parsed.data.expectedSalary,
      available_days: parsed.data.availableDays ?? null,
      available_time: parsed.data.availableTime,
    })
    .eq("id", profile.id);

  if (error) return failure(error.message);
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/teachers");
  return success();
}

export async function updateGuardianProfile(
  input: unknown,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (profile.role !== "guardian") return failure("Invalid role.");

  const parsed = guardianProfileSchema.safeParse(input);
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("guardian_profiles")
    .update({
      relationship_to_student: parsed.data.relationshipToStudent,
      contact_preference: parsed.data.contactPreference,
      linked_student_id: parsed.data.linkedStudentId || null,
      bio: parsed.data.bio,
    })
    .eq("id", profile.id);

  if (error) return failure(error.message);
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return success();
}
