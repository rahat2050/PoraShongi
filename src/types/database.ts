import {
  type AccountStatus,
  type GuardianProfile,
  type Profile,
  type StudentProfile,
  type TeacherProfile,
  type VerificationStatus,
} from "@/types/index";
import { type UserRole } from "@/lib/auth/roles";

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
          location?: string | null;
          account_status?: AccountStatus;
          verification_status?: VerificationStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Omit<Profile, "id" | "created_at"> & { created_at?: string }
        >;
        Relationships: [];
      };
      student_profiles: {
        Row: StudentProfile;
        Insert: {
          id: string;
          grade?: string | null;
          institution?: string | null;
          subjects_of_interest?: string[] | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Omit<StudentProfile, "id" | "created_at"> & { created_at?: string }
        >;
        Relationships: [];
      };
      teacher_profiles: {
        Row: TeacherProfile;
        Insert: {
          id: string;
          headline?: string | null;
          bio?: string | null;
          subjects?: string[] | null;
          qualifications?: string[] | null;
          experience_years?: number | null;
          expected_salary?: string | null;
          availability?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Omit<TeacherProfile, "id" | "created_at"> & { created_at?: string }
        >;
        Relationships: [];
      };
      guardian_profiles: {
        Row: GuardianProfile;
        Insert: {
          id: string;
          relationship_to_student?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Omit<GuardianProfile, "id" | "created_at"> & { created_at?: string }
        >;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      account_status: AccountStatus;
      verification_status: VerificationStatus;
    };
    CompositeTypes: Record<never, never>;
  };
}
