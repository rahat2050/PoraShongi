import { z } from "zod";

export const tuitionSchema = z.object({
  title: z.string().trim().min(3, "টাইটেল কমপক্ষে ৩ অক্ষরের হতে হবে।").max(140, "টাইটেল খুব লম্বা।"),
  classLevel: z.string().min(1, "ক্লাস বাছুন।"),
  subject: z.string().min(1, "বিষয় বাছুন।"),
  district: z.string().trim().max(80).optional().or(z.literal("")),
  area: z.string().trim().max(80).optional().or(z.literal("")),
  budget: z
    .union([z.string().trim(), z.number()])
    .optional()
    .refine(
      (v) => v === undefined || v === "" || (Number.isFinite(Number(v)) && Number(v) >= 0),
      "সঠিক বাজেট দিন (০ বা তার বেশি)।",
    )
    .transform((v) => (v === undefined || v === "" ? null : Number(v))),
  budgetNegotiable: z.boolean().optional(),
  teachingMode: z.string().min(1, "মোড বাছুন।"),
  preferredDays: z.array(z.string()).optional(),
  preferredTime: z.string().trim().max(80).optional().or(z.literal("")),
  requirements: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type TuitionInput = z.infer<typeof tuitionSchema>;
