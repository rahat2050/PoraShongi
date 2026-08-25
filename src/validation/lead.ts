import { z } from "zod";

/** Bangladeshi mobile: 01[3-9] + 8 digits, after stripping +88 / 88 prefixes. */
export function normalizeBdPhone(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (digits.length === 13 && digits.startsWith("880")) return digits.slice(3);
  if (digits.length === 10 && digits.startsWith("1")) return `0${digits}`;
  return digits;
}

export const bdPhoneSchema = z
  .string()
  .trim()
  .min(1, "মোবাইল নম্বর দিন।")
  .transform(normalizeBdPhone)
  .refine((value) => /^01[3-9][0-9]{8}$/.test(value), "সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন 01712345678)।");

export const tutorLeadSchema = z.object({
  contactName: z.string().trim().min(2, "আপনার নাম লিখুন।").max(80, "নাম খুব লম্বা।"),
  contactPhone: bdPhoneSchema,
  contactEmail: z
    .string()
    .trim()
    .max(160)
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || z.string().email().safeParse(value).success,
      "সঠিক ইমেইল দিন অথবা খালি রাখুন।",
    ),
  classLevel: z.string().trim().min(1, "ক্লাস বাছুন।").max(60),
  subjects: z
    .array(z.string().trim().min(1))
    .min(1, "কমপক্ষে একটি বিষয় বাছুন।")
    .max(8, "সর্বোচ্চ ৮টি বিষয় বাছা যাবে।"),
  district: z.string().trim().max(80).optional().or(z.literal("")),
  area: z.string().trim().max(80).optional().or(z.literal("")),
  teachingMode: z.enum(["online", "offline", "both"], {
    errorMap: () => ({ message: "পড়ানোর মাধ্যম বাছুন।" }),
  }),
  preferredDays: z.array(z.string().trim()).max(7).optional(),
  preferredTime: z.string().trim().max(80).optional().or(z.literal("")),
  budget: z
    .union([z.string().trim(), z.number()])
    .optional()
    .refine(
      (v) => v === undefined || v === "" || (Number.isFinite(Number(v)) && Number(v) >= 0 && Number(v) <= 1_000_000),
      "সঠিক বাজেট দিন।",
    )
    .transform((v) => (v === undefined || v === "" ? null : Number(v))),
  note: z.string().trim().max(1000, "বিবরণ খুব লম্বা।").optional().or(z.literal("")),
  /** Honeypot — বট ছাড়া কেউ এটি পূরণ করে না, তাই মান থাকলে নীরবে বাতিল। */
  website: z.string().max(0).optional().or(z.literal("")),
});

export type TutorLeadInput = z.input<typeof tutorLeadSchema>;
export type TutorLeadParsed = z.output<typeof tutorLeadSchema>;
