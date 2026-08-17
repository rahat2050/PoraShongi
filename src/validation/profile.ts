import { z } from "zod";
import { normalizeProfileImageUrl } from "@/lib/profile-image-url";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal("")).transform((v) => v || null);

export const baseProfileSchema = z.object({
  fullName: z.string().trim().min(2, "নাম লিখুন।").max(120),
  district: z.string().trim().max(80).optional().or(z.literal("")),
  area: z.string().trim().max(80).optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  isMinor: z.boolean().optional(),
  guardianConsent: z.boolean().optional(),
  avatarUrl: z.string().trim().optional().transform((value, ctx) => {
    if (!value) return "";
    const result = normalizeProfileImageUrl(value);
    if (!result.ok) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.error });
      return z.NEVER;
    }
    return result.url;
  }),
});

export const studentProfileSchema = z.object({
  grade: z.string().min(1, "ক্লাস বাছুন।"),
  studentGroup: z.string().optional(),
  institution: optionalText(160),
  subjectsOfInterest: z.array(z.string()).optional(),
  teachingModePreference: z.string().min(1, "মোড বাছুন।"),
  budget: z
    .string()
    .optional()
    .transform((v) => {
      if (!v || v === "") return null;
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 ? n : null;
    }),
  preferredDays: z.array(z.string()).optional(),
  preferredTime: optionalText(80),
  bio: optionalText(600),
});

export const teacherProfileSchema = z.object({
  headline: optionalText(160),
  bio: optionalText(1200),
  education: z.string().min(1, "শিক্ষাগত যোগ্যতা লিখুন।"),
  institution: optionalText(160),
  subjects: z.array(z.string()).min(1, "কমপক্ষে ১টা বিষয় বাছুন।"),
  qualifications: z.array(z.string()).optional(),
  classesTaught: z.array(z.string()).min(1, "কমপক্ষে ১টা ক্লাস বাছুন।"),
  experienceYears: z
    .string()
    .optional()
    .transform((v) => {
      if (!v || v === "") return null;
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 && n <= 80 ? n : null;
    }),
  teachingMode: z.string().min(1, "মোড বাছুন।"),
  teachingArea: optionalText(160),
  expectedSalary: z
    .string()
    .optional()
    .transform((v) => {
      if (!v || v === "") return null;
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 ? n : null;
    }),
  availableDays: z.array(z.string()).optional(),
  availableTime: optionalText(80),
  teachingStyle: optionalText(500),
  languages: z.array(z.string()).optional(),
});

export const guardianProfileSchema = z.object({
  relationshipToStudent: z.string().min(1, "সম্পর্ক বাছুন।"),
  contactPreference: z.string().min(1, "যোগাযোগ মাধ্যম বাছুন।"),
  linkedStudentId: z.string().uuid().optional().or(z.literal("")),
  bio: optionalText(600),
});
