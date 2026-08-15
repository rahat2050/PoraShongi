import { type UserRole } from "@/lib/auth/roles";

export type AccountStatus = "active" | "suspended" | "pending" | "deleted";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";
export type TuitionStatus = "open" | "assigned" | "paused" | "completed" | "closed";
export type RequestStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  district: string | null;
  area: string | null;
  latitude: number | null;
  longitude: number | null;
  gender: string | null;
  is_minor: boolean;
  guardian_consent: boolean;
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
  rating_avg: number;
  review_count: number;
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

export type RoleProfile = StudentProfile | TeacherProfile | GuardianProfile;

export type Tuition = {
  id: string;
  poster_id: string;
  student_id: string | null;
  title: string;
  class_level: string;
  subject: string;
  district: string | null;
  area: string | null;
  latitude: number | null;
  longitude: number | null;
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

export type Favorite = {
  id: string;
  user_id: string;
  teacher_id: string | null;
  tuition_id: string | null;
  created_at: string;
};

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

/** Teacher search result (search_teachers RPC)। */
export type TeacherPublic = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  gender: string | null;
  district: string | null;
  area: string | null;
  verification_status: VerificationStatus;
  headline: string | null;
  education: string | null;
  subjects: string[] | null;
  classes_taught: string[] | null;
  experience_years: number | null;
  teaching_mode: string | null;
  teaching_area: string | null;
  expected_salary: number | null;
  available_days: string[] | null;
  available_time: string | null;
  bio: string | null;
  rating_avg: number | null;
  review_count: number | null;
  distance_km: number | null;
};

/** get_public_teacher RPC (আরও detail)। */
export type TeacherDetail = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  gender: string | null;
  district: string | null;
  area: string | null;
  verification_status: VerificationStatus;
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
  rating_avg: number | null;
  review_count: number | null;
  created_at: string;
};

/** Matched teacher (match_teachers_for_tuition)। */
export type TeacherMatch = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  district: string | null;
  area: string | null;
  headline: string | null;
  subjects: string[] | null;
  classes_taught: string[] | null;
  experience_years: number | null;
  teaching_mode: string | null;
  expected_salary: number | null;
  rating_avg: number | null;
  review_count: number | null;
  score: number;
  distance_km: number | null;
};

/** Public tuition (search_tuitions / get_public_tuition)। */
export type TuitionPublic = {
  id: string;
  title: string;
  class_level: string;
  subject: string;
  district: string | null;
  area: string | null;
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

export type ProfilePublic = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  gender: string | null;
  district: string | null;
  area: string | null;
};

export type StudentOption = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  district: string | null;
  area: string | null;
};

export interface SearchResponse<T> {
  total: number;
  page: number;
  page_size: number;
  results: T[];
}
