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
  phone: string | null;
  phone_verified: boolean;
  education_verified: boolean;
  identity_verified: boolean;
  trusted_tutor: boolean;
  is_super_admin: boolean;
  referral_code: string | null;
  is_premium: boolean;
  premium_until: string | null;
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
  teaching_style: string | null;
  languages: string[] | null;
  rating_avg: number;
  review_count: number;
  profile_views: number;
  trial_available: boolean;
  trial_price: number;
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
  is_featured: boolean;
  featured_until: string | null;
  meeting_link: string | null;
  is_batch: boolean;
  batch_size: number | null;
  seats_filled: number;
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

/** Phase 3 entities */
export type Session = {
  id: string;
  tuition_id: string;
  teacher_id: string;
  student_id: string | null;
  scheduled_at: string;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  attendance: "present" | "absent" | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Conversation = {
  id: string;
  tuition_id: string | null;
  participant_a: string;
  participant_b: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  status: "sent" | "read";
  created_at: string;
};

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

/** Homepage review spotlight (top_reviews RPC)। */
export type TestimonialPublic = {
  id: string;
  rating: number;
  body: string;
  verified: boolean;
  created_at: string;
  reviewer_name: string | null;
  reviewer_display_name: string | null;
  reviewer_avatar: string | null;
  reviewer_role: UserRole;
  teacher_id: string;
  teacher_name: string | null;
  teacher_display_name: string | null;
};

export type TeacherReputation = {
  verification_status: VerificationStatus;
  phone_verified: boolean;
  education_verified: boolean;
  identity_verified: boolean;
  trusted_tutor: boolean;
  tier: "unverified" | "phone" | "education" | "identity" | "trusted";
  rating_avg: number;
  review_count: number;
  completed_tuitions: number;
  response_count: number;
  response_rate: number;
  cancellation_rate: number;
  avg_response_hours: number | null;
};

export type AdminAuditLog = {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

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

export type Block = {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
};

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
  email_notify?: boolean;
  updated_at: string;
};

export type ContactRequest = {
  id: string;
  sender_id: string;
  teacher_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  responded_at: string | null;
};

export type Referral = {
  id: string;
  referrer_id: string;
  referred_id: string | null;
  code: string;
  created_at: string;
};

export type CoachingCenter = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  district: string | null;
  area: string | null;
  contact: string | null;
  website: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
};

export type CoachingCourse = {
  id: string;
  center_id: string;
  title: string;
  description: string | null;
  price: number | null;
  created_at: string;
};

export type EducationResource = {
  id: string;
  uploader_id: string;
  title: string;
  description: string | null;
  resource_url: string;
  subject: string | null;
  class_level: string | null;
  price: number;
  created_at: string;
};

export type BatchMember = {
  id: string;
  tuition_id: string;
  student_id: string;
  created_at: string;
};

export type TrialRequest = {
  id: string;
  tuition_id: string | null;
  sender_id: string;
  teacher_id: string;
  message: string | null;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  responded_at: string | null;
};

export type BlogPost = {
  id: string;
  author_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type LeaderboardTeacher = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  district: string | null;
  area: string | null;
  is_premium: boolean;
  verification_status: VerificationStatus;
  subjects: string[] | null;
  classes_taught: string[] | null;
  experience_years: number | null;
  rating_avg: number | null;
  review_count: number | null;
  completed_tuitions: number;
  leaderboard_score: number;
};

export type AdminAnalytics = {
  users: number;
  teachers: number;
  students: number;
  guardians: number;
  tuitions: number;
  open_tuitions: number;
  requests: number;
  accepted: number;
  reviews: number;
  match_rate: number;
  top_subjects: { subject: string; c: number }[];
  top_districts: { district: string; c: number }[];
};

export type VisitorDailyStat = {
  visit_date: string;
  visitors: number;
  page_views: number;
  updated_at: string;
};

export type VisitorPeriodStat = {
  visitors: number;
  page_views: number;
};

export type SuperAdminVisitorAnalytics = {
  today: VisitorPeriodStat;
  last_7_days: VisitorPeriodStat;
  last_30_days: VisitorPeriodStat;
  all_time: VisitorPeriodStat;
  daily: Array<{
    date: string;
    visitors: number;
    page_views: number;
  }>;
};

export type HomeFeed = {
  teachers: TeacherPublic[];
  featured_teachers: TeacherPublic[];
  recent_teachers: TeacherPublic[];
  tuitions: TuitionPublic[];
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
  is_premium?: boolean;
  premium_until?: string | null;
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
  created_at?: string;
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
  is_premium?: boolean;
  premium_until?: string | null;
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
  teaching_style?: string | null;
  languages?: string[] | null;
  rating_avg: number | null;
  review_count: number | null;
  profile_views?: number;
  trial_available?: boolean;
  trial_price?: number | null;
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
  is_featured?: boolean;
  featured_until?: string | null;
  meeting_link?: string | null;
  is_batch?: boolean;
  batch_size?: number | null;
  seats_filled?: number;
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
