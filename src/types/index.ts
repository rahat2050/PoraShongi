import { type UserRole } from "@/lib/auth/roles";

/** Account lifecycle status (used for moderation / bans). */
export type AccountStatus = "active" | "suspended" | "pending" | "deleted";

/** Verification lifecycle status. */
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

/** Teaching / tuition mode. */
export type TeachingMode = "online" | "offline" | "both";

/** Tuition lifecycle status. */
export type TuitionStatus = "open" | "assigned" | "paused" | "completed" | "closed";

/** Tuition request status. */
export type RequestStatus = "pending" | "accepted" | "rejected" | "withdrawn";

/** Profile visibility. */
export type ProfileVisibility = "public" | "private";

/** Base profile — one row per authenticated user. */
export type Profile = {
  id: string;
  role: UserRole;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  location: string | null;
  phone: string | null;
  phone_verified: boolean;
  account_status: AccountStatus;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
};

export type StudentProfile = {
  id: string;
  grade: string | null;
  student_group: string | null;
  institution: string | null;
  subjects_of_interest: string[] | null;
  teaching_mode_preference: string | null;
  budget: number | null;
  preferred_days: string[] | null;
  preferred_time: string | null;
  profile_visibility: string;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export type TeacherProfile = {
  id: string;
  headline: string | null;
  bio: string | null;
  education: string | null;
  institution: string | null;
  subjects: string[] | null;
  qualifications: string[] | null;
  classes_taught: string[] | null;
  experience_years: number | null;
  teaching_mode: string | null;
  teaching_area: string | null;
  expected_salary: number | null;
  available_days: string[] | null;
  available_time: string | null;
  created_at: string;
  updated_at: string;
};

export type GuardianProfile = {
  id: string;
  relationship_to_student: string | null;
  contact_preference: string | null;
  linked_student_id: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

/** A role-specific profile union. */
export type RoleProfile = StudentProfile | TeacherProfile | GuardianProfile;

/** Tuition requirement / post. */
export type Tuition = {
  id: string;
  poster_id: string;
  student_id: string | null;
  title: string;
  class_level: string;
  subject: string;
  location: string | null;
  budget: number | null;
  budget_negotiable: boolean;
  teaching_mode: string;
  preferred_days: string[] | null;
  preferred_time: string | null;
  requirements: string | null;
  status: TuitionStatus;
  created_at: string;
  updated_at: string;
};

/** Tuition request sent from a student/guardian to a teacher. */
export type TuitionRequest = {
  id: string;
  tuition_id: string;
  sender_id: string;
  teacher_id: string;
  student_id: string | null;
  message: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  responded_at: string | null;
};

/** A saved teacher. */
export type Favorite = {
  id: string;
  user_id: string;
  teacher_id: string;
  created_at: string;
};

/** In-app notification. */
export type AppNotification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
};

/** Public-facing teacher card returned by the search RPC. */
export type TeacherPublic = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  location: string | null;
  verification_status: VerificationStatus;
  phone_verified: boolean;
  headline: string | null;
  education: string | null;
  institution: string | null;
  qualifications: string[] | null;
  subjects: string[] | null;
  classes_taught: string[] | null;
  experience_years: number | null;
  teaching_mode: string | null;
  teaching_area: string | null;
  expected_salary: number | null;
  available_days: string[] | null;
  available_time: string | null;
  bio: string | null;
  is_verified?: boolean;
  created_at?: string;
};

/** Public-facing tuition listing row returned by the search RPC. */
export type TuitionPublic = {
  id: string;
  title: string;
  class_level: string;
  subject: string;
  location: string | null;
  budget: number | null;
  budget_negotiable: boolean;
  teaching_mode: string;
  preferred_days: string[] | null;
  preferred_time: string | null;
  requirements: string | null;
  status: TuitionStatus;
  created_at: string;
  poster_id: string;
  student_id?: string | null;
  poster_name: string | null;
  poster_display_name: string | null;
  poster_role: UserRole;
  poster_avatar: string | null;
};

/** Paginated search response shape. */
export interface SearchResponse<T> {
  total: number;
  page: number;
  page_size: number;
  results: T[];
}
