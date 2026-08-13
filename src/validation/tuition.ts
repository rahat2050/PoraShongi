import { z } from "zod";

/** Create / edit a tuition requirement. */
export const tuitionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(140, "Title is too long."),
  classLevel: z.string().min(1, "Please choose a class."),
  subject: z.string().min(1, "Please choose a subject."),
  location: z.string().trim().max(160, "Location is too long.").optional(),
  budget: z
    .union([
      z.string().trim(),
      z.number().min(0, "Budget cannot be negative."),
    ])
    .optional()
    .transform((val) => {
      if (val === "" || val === null || val === undefined) return null;
      const num = typeof val === "number" ? val : Number(val);
      return Number.isFinite(num) && num >= 0 ? num : null;
    }),
  budgetNegotiable: z.boolean().optional(),
  teachingMode: z.string().min(1, "Please choose a teaching mode."),
  preferredDays: z.array(z.string()).optional(),
  preferredTime: z.string().trim().max(80, "Time is too long.").optional(),
  requirements: z.string().trim().max(1000, "Requirements are too long.").optional(),
});
export type TuitionInput = z.infer<typeof tuitionSchema>;

/** Send a tuition request to a teacher. */
export const sendRequestSchema = z.object({
  tuitionId: z.string().uuid("Please choose a valid tuition."),
  teacherId: z.string().uuid("Invalid teacher."),
  message: z.string().trim().max(800, "Message is too long.").optional(),
});
export type SendRequestInput = z.infer<typeof sendRequestSchema>;
