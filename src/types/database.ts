import {
  type AccountStatus,
  type AdminAuditLog,
  type AppNotification,
  type BatchMember,
  type Block,
  type BlogPost,
  type CoachingCenter,
  type CoachingCourse,
  type ContactRequest,
  type Conversation,
  type EducationResource,
  type Favorite,
  type GuardianProfile,
  type Message,
  type NotificationPreferences,
  type Profile,
  type Referral,
  type Report,
  type RequestStatus,
  type Review,
  type Session,
  type StudentProfile,
  type TeacherProfile,
  type TrialRequest,
  type Tuition,
  type TuitionRequest,
  type TuitionStatus,
  type VerificationStatus,
  type VisitorDailyStat,
} from "@/types/index";
import { type UserRole } from "@/lib/auth/roles";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          role?: UserRole;
          full_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          district?: string | null;
          area?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          gender?: string | null;
          is_minor?: boolean;
          guardian_consent?: boolean;
          phone?: string | null;
          phone_verified?: boolean;
          education_verified?: boolean;
          identity_verified?: boolean;
          trusted_tutor?: boolean;
          is_super_admin?: boolean;
          referral_code?: string | null;
          is_premium?: boolean;
          premium_until?: string | null;
          account_status?: AccountStatus;
          verification_status?: VerificationStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, "id" | "created_at"> & { created_at?: string }>;
        Relationships: [];
      };
      visitor_daily_stats: {
        Row: VisitorDailyStat;
        Insert: {
          visit_date: string;
          visitors?: number;
          page_views?: number;
          updated_at?: string;
        };
        Update: Partial<Omit<VisitorDailyStat, "visit_date">>;
        Relationships: [];
      };
      student_profiles: {
        Row: StudentProfile;
        Insert: {
          id: string;
          grade?: string | null;
          student_group?: string | null;
          institution?: string | null;
          subjects_of_interest?: string[] | null;
          teaching_mode_preference?: string | null;
          budget?: number | null;
          preferred_days?: string[] | null;
          preferred_time?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<StudentProfile, "id" | "created_at"> & { created_at?: string }>;
        Relationships: [];
      };
      teacher_profiles: {
        Row: TeacherProfile;
        Insert: {
          id: string;
          headline?: string | null;
          bio?: string | null;
          education?: string | null;
          institution?: string | null;
          subjects?: string[] | null;
          qualifications?: string[] | null;
          classes_taught?: string[] | null;
          experience_years?: number | null;
          teaching_mode?: string | null;
          teaching_area?: string | null;
          expected_salary?: number | null;
          available_days?: string[] | null;
          available_time?: string | null;
          teaching_style?: string | null;
          languages?: string[] | null;
          rating_avg?: number;
          review_count?: number;
          profile_views?: number;
          trial_available?: boolean;
          trial_price?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<TeacherProfile, "id" | "created_at"> & { created_at?: string }>;
        Relationships: [];
      };
      guardian_profiles: {
        Row: GuardianProfile;
        Insert: {
          id: string;
          relationship_to_student?: string | null;
          contact_preference?: string | null;
          linked_student_id?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<GuardianProfile, "id" | "created_at"> & { created_at?: string }>;
        Relationships: [];
      };
      tuitions: {
        Row: Tuition;
        Insert: {
          id?: string;
          poster_id: string;
          student_id?: string | null;
          title: string;
          class_level: string;
          subject: string;
          district?: string | null;
          area?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          budget?: number | null;
          budget_negotiable?: boolean;
          teaching_mode?: string;
          preferred_days?: string[] | null;
          preferred_time?: string | null;
          requirements?: string | null;
          is_featured?: boolean;
          featured_until?: string | null;
          meeting_link?: string | null;
          is_batch?: boolean;
          batch_size?: number | null;
          seats_filled?: number;
          status?: TuitionStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Tuition, "id" | "poster_id" | "created_at"> & { created_at?: string }>;
        Relationships: [];
      };
      tuition_requests: {
        Row: TuitionRequest;
        Insert: {
          id?: string;
          tuition_id: string;
          sender_id: string;
          teacher_id: string;
          student_id?: string | null;
          message?: string | null;
          status?: RequestStatus;
          created_at?: string;
          updated_at?: string;
          responded_at?: string | null;
        };
        Update: Partial<Omit<TuitionRequest, "id" | "created_at"> & { created_at?: string }>;
        Relationships: [];
      };
      favorites: {
        Row: Favorite;
        Insert: {
          id?: string;
          user_id: string;
          teacher_id?: string | null;
          tuition_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Omit<Favorite, "id" | "created_at"> & { created_at?: string }>;
        Relationships: [];
      };
      notifications: {
        Row: AppNotification;
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body?: string | null;
          link?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: Partial<Omit<AppNotification, "id" | "created_at"> & { created_at?: string }>;
        Relationships: [];
      };
      sessions: {
        Row: Session;
        Insert: {
          id?: string;
          tuition_id: string;
          teacher_id: string;
          student_id?: string | null;
          scheduled_at: string;
          status?: Session["status"];
          attendance?: Session["attendance"];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Session, "id" | "created_at"> & { created_at?: string }>;
        Relationships: [];
      };
      conversations: {
        Row: Conversation;
        Insert: {
          id?: string;
          tuition_id?: string | null;
          participant_a: string;
          participant_b: string;
          created_at?: string;
          updated_at?: string;
          last_message_at?: string | null;
        };
        Update: Partial<Omit<Conversation, "id" | "created_at"> & { created_at?: string }>;
        Relationships: [];
      };
      messages: {
        Row: Message;
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          status?: Message["status"];
          created_at?: string;
        };
        Update: Partial<Omit<Message, "id" | "created_at"> & { created_at?: string }>;
        Relationships: [];
      };
      reviews: {
        Row: Review;
        Insert: {
          id?: string;
          teacher_id: string;
          reviewer_id: string;
          tuition_id?: string | null;
          rating: number;
          body?: string | null;
          verified?: boolean;
          status?: Review["status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Review, "id" | "created_at"> & { created_at?: string }>;
        Relationships: [];
      };
      admin_audit_log: {
        Row: AdminAuditLog;
        Insert: {
          id?: string;
          admin_id: string;
          action: string;
          target_type: string;
          target_id?: string | null;
          details?: Json;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      reports: {
        Row: Report;
        Insert: {
          id?: string;
          reporter_id: string;
          target_type: Report["target_type"];
          target_id: string;
          category: Report["category"];
          details?: string | null;
          status?: Report["status"];
          resolution?: string | null;
          created_at?: string;
          updated_at?: string;
          resolved_at?: string | null;
        };
        Update: Partial<Omit<Report, "id" | "created_at"> & { created_at?: string }>;
        Relationships: [];
      };
      blocks: {
        Row: Block;
        Insert: {
          id?: string;
          blocker_id: string;
          blocked_id: string;
          created_at?: string;
        };
        Update: Partial<Omit<Block, "id" | "created_at"> & { created_at?: string }>;
        Relationships: [];
      };
      notification_preferences: {
        Row: NotificationPreferences;
        Insert: {
          user_id: string;
          new_match?: boolean;
          new_request?: boolean;
          request_response?: boolean;
          new_message?: boolean;
          upcoming_class?: boolean;
          schedule_change?: boolean;
          review_received?: boolean;
          verification_update?: boolean;
          email_notify?: boolean;
          updated_at?: string;
        };
        Update: Partial<Omit<NotificationPreferences, "user_id" | "updated_at"> & { updated_at?: string }>;
        Relationships: [];
      };
      contact_requests: {
        Row: ContactRequest;
        Insert: {
          id?: string;
          sender_id: string;
          teacher_id: string;
          status?: ContactRequest["status"];
          created_at?: string;
          responded_at?: string | null;
        };
        Update: Partial<Omit<ContactRequest, "id" | "created_at"> & { created_at?: string }>;
        Relationships: [];
      };
      referrals: {
        Row: Referral;
        Insert: {
          id?: string;
          referrer_id: string;
          referred_id?: string | null;
          code: string;
          created_at?: string;
        };
        Update: Partial<Omit<Referral, "id" | "created_at"> & { created_at?: string }>;
        Relationships: [];
      };
      coaching_centers: {
        Row: CoachingCenter;
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string | null;
          district?: string | null;
          area?: string | null;
          contact?: string | null;
          website?: string | null;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<CoachingCenter, "id" | "created_at"> & { created_at?: string }>;
        Relationships: [];
      };
      coaching_courses: {
        Row: CoachingCourse;
        Insert: {
          id?: string;
          center_id: string;
          title: string;
          description?: string | null;
          price?: number | null;
          created_at?: string;
        };
        Update: Partial<Omit<CoachingCourse, "id" | "created_at"> & { created_at?: string }>;
        Relationships: [];
      };
      education_resources: {
        Row: EducationResource;
        Insert: {
          id?: string;
          uploader_id: string;
          title: string;
          description?: string | null;
          resource_url: string;
          subject?: string | null;
          class_level?: string | null;
          price?: number;
          created_at?: string;
        };
        Update: Partial<Omit<EducationResource, "id" | "created_at"> & { created_at?: string }>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          profile_id: string;
          plan: string;
          method: "bkash" | "nagad" | "card" | "manual" | null;
          amount: number | null;
          status: "pending" | "paid" | "failed" | "refunded";
          started_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          plan?: string;
          method?: "bkash" | "nagad" | "card" | "manual" | null;
          amount?: number | null;
          status?: "pending" | "paid" | "failed" | "refunded";
          started_at?: string;
          expires_at?: string | null;
        };
        Update: Partial<{
          plan?: string;
          method?: "bkash" | "nagad" | "card" | "manual" | null;
          amount?: number | null;
          status?: "pending" | "paid" | "failed" | "refunded";
          started_at?: string;
          expires_at?: string | null;
        }>;
        Relationships: [];
      };
      batch_members: {
        Row: BatchMember;
        Insert: {
          id?: string;
          tuition_id: string;
          student_id: string;
          created_at?: string;
        };
        Update: Partial<Omit<BatchMember, "id" | "created_at"> & { created_at?: string }>;
        Relationships: [];
      };
      trial_requests: {
        Row: TrialRequest;
        Insert: {
          id?: string;
          tuition_id?: string | null;
          sender_id: string;
          teacher_id: string;
          message?: string | null;
          status?: TrialRequest["status"];
          created_at?: string;
          responded_at?: string | null;
        };
        Update: Partial<Omit<TrialRequest, "id" | "created_at"> & { created_at?: string }>;
        Relationships: [];
      };
      blog_posts: {
        Row: BlogPost;
        Insert: {
          id?: string;
          author_id?: string | null;
          title: string;
          slug: string;
          excerpt?: string | null;
          content: string;
          category?: string;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<BlogPost, "id" | "created_at"> & { created_at?: string }>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      verification_tier: { Args: { p_user_id: string }; Returns: string };
      search_teachers: {
        Args: {
          p_class?: string | null;
          p_subject?: string | null;
          p_district?: string | null;
          p_area?: string | null;
          p_lat?: number | null;
          p_lon?: number | null;
          p_max_distance_km?: number | null;
          p_mode?: string | null;
          p_gender?: string | null;
          p_min_experience?: number | null;
          p_min_rating?: number | null;
          p_verified?: boolean | null;
          p_sort?: string | null;
          p_page?: number | null;
          p_page_size?: number | null;
        };
        Returns: Json;
      };
      search_tuitions: {
        Args: {
          p_class?: string | null;
          p_subject?: string | null;
          p_district?: string | null;
          p_area?: string | null;
          p_min_budget?: number | null;
          p_max_budget?: number | null;
          p_mode?: string | null;
          p_day?: string | null;
          p_time?: string | null;
          p_page?: number | null;
          p_page_size?: number | null;
        };
        Returns: Json;
      };
      match_teachers_for_tuition: {
        Args: { p_tuition_id: string; p_limit?: number | null };
        Returns: Json;
      };
      compute_match_score: {
        Args: {
          p_teacher_id: string;
          p_class?: string | null;
          p_subject?: string | null;
          p_district?: string | null;
          p_area?: string | null;
          p_lat?: number | null;
          p_lon?: number | null;
          p_mode?: string | null;
          p_budget?: number | null;
          p_days?: string[] | null;
        };
        Returns: number;
      };
      distance_between: {
        Args: {
          lat1?: number | null;
          lon1?: number | null;
          lat2?: number | null;
          lon2?: number | null;
        };
        Returns: number;
      };
      get_public_teacher: { Args: { p_teacher_id: string }; Returns: Json };
      get_public_teachers: { Args: { p_ids: string[] }; Returns: Json };
      get_public_tuition: { Args: { p_tuition_id: string }; Returns: Json };
      get_profiles_public: { Args: { p_ids: string[] }; Returns: Json };
      list_students: { Args: Record<PropertyKey, never>; Returns: Json };
      get_teacher_reputation: { Args: { p_teacher_id: string }; Returns: Json };
      get_teacher_reviews: {
        Args: { p_teacher_id: string; p_page?: number | null; p_page_size?: number | null };
        Returns: Json;
      };
      get_teacher_own_reviews: { Args: { p_teacher_id: string }; Returns: Json };
      get_teacher_phone: { Args: { p_teacher_id: string }; Returns: string };
      cleanup_old_notifications: { Args: { p_days?: number | null }; Returns: number };
      cleanup_expired_messages: { Args: Record<PropertyKey, never>; Returns: number };
      permanently_delete_own_account: { Args: { p_confirmation: string }; Returns: undefined };
      record_profile_view: { Args: { p_teacher_id: string }; Returns: undefined };
      is_premium_active: { Args: { p_profile_id: string }; Returns: boolean };
      match_tuitions_for_teacher_rpc: {
        Args: { p_teacher_id: string; p_limit?: number | null };
        Returns: Json;
      };
      toggle_own_account: { Args: { p_active: boolean }; Returns: undefined };
      top_teachers: { Args: { p_district?: string | null; p_limit?: number | null }; Returns: Json };
      recommend_teachers: { Args: { p_teacher_id: string; p_limit?: number | null }; Returns: Json };
      admin_analytics: { Args: Record<PropertyKey, never>; Returns: Json };
      record_site_visit: { Args: { p_is_unique?: boolean | null }; Returns: undefined };
      super_admin_visitor_analytics: { Args: { p_days?: number | null }; Returns: Json };
      home_feed: { Args: { p_teachers?: number | null; p_tuitions?: number | null }; Returns: Json };
      site_stats: { Args: Record<PropertyKey, never>; Returns: Json };
      pending_request_count: { Args: { p_user_id: string }; Returns: number };
    };
    Enums: {
      user_role: UserRole;
      account_status: AccountStatus;
      verification_status: VerificationStatus;
      tuition_status: TuitionStatus;
      request_status: RequestStatus;
    };
    CompositeTypes: Record<never, never>;
  };
}

export type Tables = Database["public"]["Tables"];
