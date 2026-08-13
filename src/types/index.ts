import { type UserRole } from "@/lib/auth/roles";

/** Account lifecycle status (used for moderation / bans). */
export type AccountStatus = "active" | "suspended" | "pending" | "deleted";

/** Verification lifecycle status. */
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

/** Verification tier (trust ladder). */
export type VerificationTier = "unverified" | "phone" | "education" | "identity" | "trusted";

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
  gender: string | null;
  is_minor: boolean;
  guardian_consent: boolean;
  education_verified: boolean;
  identity_verified: boolean;
  trusted_tutor: boolean;
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

/** Scheduled tuition session (schedule + attendance). */
export type Session = {
  id: string;
  tuition_id: string;
  teacher_id: string;
  student_id: string | null;
  scheduled_at: string;
  end_at: string | null;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  attendance: "present" | "absent" | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

/** A conversation between two users. */
export type Conversation = {
  id: string;
  tuition_id: string | null;
  participant_a: string;
  participant_b: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
};

/** A message within a conversation. */
export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  status: "sent" | "read";
  created_at: string;
};

/** A review of a teacher. */
export type Review = {
  id: string;
  teacher_id: string;
  reviewer_id: string;
  tuition_id: string | null;
  rating: number;
  body: string | null;
  verified: boolean;
  status: "published" | "hidden" | "removed";
  created_at: string;
  updated_at: string;
};

/** A moderation report. */
export type Report = {
  id: string;
  reporter_id: string;
  target_type: "teacher" | "student" | "guardian" | "tuition" | "review" | "conversation";
  target_id: string;
  category: "fake_profile" | "harassment" | "inappropriate" | "scam" | "spam" | "safety_concern" | "other";
  details: string | null;
  status: "open" | "investigating" | "resolved" | "dismissed";
  resolution: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

/** A block between users. */
export type Block = {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
};

/** A no-match watch request. */
export type WatchRequest = {
  id: string;
  user_id: string;
  tuition_id: string | null;
  class_level: string | null;
  subject: string | null;
  location: string | null;
  teaching_mode: string | null;
  budget: number | null;
  notified: boolean;
  created_at: string;
};

/** Notification preferences. */
export type NotificationPreferences = {
  user_id: string;
  new_match: boolean;
  new_request: boolean;
  request_response: boolean;
  new_message: boolean;
  upcoming_class: boolean;
  schedule_change: boolean;
  review_received: boolean;
  verification_update: boolean;
  updated_at: string;
};

/** Public-facing teacher card returned by the search RPC. */
export type TeacherPublic = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  location: string | null;
  gender: string | null;
  verification_status: VerificationStatus;
  phone_verified: boolean;
  education_verified?: boolean;
  identity_verified?: boolean;
  trusted_tutor?: boolean;
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
  rating_avg?: number;
  review_count?: number;
  tier?: VerificationTier;
  is_verified?: boolean;
  match_score?: number;
  created_at?: string;
};

/** A matched teacher (smart matching). */
export type TeacherMatch = TeacherPublic & { score: number };

/** Teacher reputation summary. */
export type TeacherReputation = {
  verification_status: VerificationStatus;
  phone_verified: boolean;
  education_verified: boolean;
  identity_verified: boolean;
  trusted_tutor: boolean;
  tier: VerificationTier;
  rating_avg: number;
  review_count: number;
  completed_tuitions: number;
  response_rate: number;
  cancellation_rate: number;
};

/** Public review row. */
export type ReviewPublic = {
  id: string;
  rating: number;
  body: string | null;
  verified: boolean;
  created_at: string;
  reviewer_name: string | null;
  reviewer_display_name: string | null;
  reviewer_avatar: string | null;
  reviewer_role: UserRole;
};

/** A teacher's own review row (any status). */
export type OwnReview = ReviewPublic & { status: Review["status"] };

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
