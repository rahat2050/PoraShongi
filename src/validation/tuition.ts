import { z } from "zod";

export const tuitionSchema = z.object({
  title: z.string().trim().min(3, "টাইটেল কমপক্ষে ৩ অক্ষরের হতে হবে।").max(140, "টাইটেল খুব লম্বা।"),
  classLevel: z.string().min(1, "ক্লাস বাছুন।"),
  subject: z.string().min(1, "বিষয় বাছুন।"),
  district: z.string().trim().max(80).optional().or(z.literal("")),
  area: z.string().trim().max(80).optional().or(z.literal("")),
  budget: z
    .union([z.string().trim(), z.number().min(0)])
    .optional()
    .transform((v) => {
      if (v === "" || v === null || v === undefined) return null;
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) && n >= 0 ? n : null;
    }),
  budgetNegotiable: z.boolean().optional(),
  teachingMode: z.string().min(1, "মোড বাছুন।"),
  preferredDays: z.array(z.string()).optional(),
  preferredTime: z.string().trim().max(80).optional().or(z.literal("")),
  requirements: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type TuitionInput = z.infer<typeof tuitionSchema>;
