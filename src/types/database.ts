import {
  type AccountStatus,
  type AppNotification,
  type Favorite,
  type GuardianProfile,
  type Profile,
  type RequestStatus,
  type StudentProfile,
  type TeacherProfile,
  type Tuition,
  type TuitionRequest,
  type TuitionStatus,
  type VerificationStatus,
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
          account_status?: AccountStatus;
          verification_status?: VerificationStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, "id" | "created_at"> & { created_at?: string }>;
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
          rating_avg?: number;
          review_count?: number;
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
    };
    Views: Record<never, never>;
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
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
