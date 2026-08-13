import { type UserRole } from "@/lib/auth/roles";

/** Account lifecycle status (used for moderation / bans). */
export type AccountStatus = "active" | "suspended" | "pending" | "deleted";

/** Verification lifecycle status. */
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

/** Base profile — one row per authenticated user. */
export type Profile = {
  id: string;
  role: UserRole;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  location: string | null;
  account_status: AccountStatus;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
};

export type StudentProfile = {
  id: string;
  grade: string | null;
  institution: string | null;
  subjects_of_interest: string[] | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export type TeacherProfile = {
  id: string;
  headline: string | null;
  bio: string | null;
  subjects: string[] | null;
  qualifications: string[] | null;
  experience_years: number | null;
  expected_salary: string | null;
  availability: string | null;
  created_at: string;
  updated_at: string;
};

export type GuardianProfile = {
  id: string;
  relationship_to_student: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

/** A role-specific profile union. */
export type RoleProfile = StudentProfile | TeacherProfile | GuardianProfile;
