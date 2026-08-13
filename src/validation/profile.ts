import { z } from "zod";

/** Update-profile form. */
export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(120, "Name is too long."),
  displayName: z
    .string()
    .trim()
    .max(80, "Display name is too long.")
    .optional()
    .or(z.literal("")),
  location: z
    .string()
    .trim()
    .max(160, "Location is too long.")
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
