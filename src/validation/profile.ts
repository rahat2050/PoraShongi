import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal("")).transform((v) => v || null);

const days = z.array(z.string()).optional();

/** Base profile (name, avatar, location, phone). */
export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(120, "Name is too long."),
  displayName: z.string().trim().max(80, "Display name is too long.").optional().or(z.literal("")),
  location: z.string().trim().max(160, "Location is too long.").optional().or(z.literal("")),
  phone: z.string().trim().max(30, "Phone number is too long.").optional().or(z.literal("")),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/** Student profile. */
export const studentProfileSchema = z.object({
  grade: z.string().min(1, "Please choose a class."),
  studentGroup: z.string().optional(),
  institution: optionalText(160),
  subjectsOfInterest: z.array(z.string()).optional(),
  teachingModePreference: z.string().min(1, "Please choose a teaching mode."),
  budget: z
    .string()
    .optional()
    .transform((v) => {
      if (!v || v === "") return null;
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 ? n : null;
    }),
  preferredDays: days,
  preferredTime: optionalText(80),
  bio: optionalText(1000),
});
export type StudentProfileInput = z.infer<typeof studentProfileSchema>;

/** Teacher profile. */
export const teacherProfileSchema = z.object({
  headline: optionalText(160),
  bio: optionalText(1200),
  education: z.string().min(1, "Please describe your education."),
  institution: optionalText(160),
  subjects: z.array(z.string()).min(1, "Choose at least one subject."),
  qualifications: z.array(z.string()).optional(),
  classesTaught: z.array(z.string()).min(1, "Choose at least one class."),
  experienceYears: z
    .string()
    .optional()
    .transform((v) => {
      if (!v || v === "") return null;
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 && n <= 80 ? n : null;
    }),
  teachingMode: z.string().min(1, "Please choose a teaching mode."),
  teachingArea: optionalText(160),
  expectedSalary: z
    .string()
    .optional()
    .transform((v) => {
      if (!v || v === "") return null;
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 ? n : null;
    }),
  availableDays: days,
  availableTime: optionalText(80),
});
export type TeacherProfileInput = z.infer<typeof teacherProfileSchema>;

/** Guardian profile. */
export const guardianProfileSchema = z.object({
  relationshipToStudent: z.string().min(1, "Please choose your relationship."),
  contactPreference: z.string().min(1, "Please choose a contact preference."),
  linkedStudentId: z.string().uuid("Invalid student.").optional().or(z.literal("")),
  bio: optionalText(600),
});
export type GuardianProfileInput = z.infer<typeof guardianProfileSchema>;
