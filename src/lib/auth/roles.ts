/**
 * User role definitions shared across the app.
 * Roles: student, teacher, guardian, admin.
 */
export const USER_ROLES = ["student", "teacher", "guardian", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

/** Selectable roles at registration (admin is never self-assignable). */
export const REGISTERABLE_ROLES = ["student", "teacher", "guardian"] as const;

export const ROLE_LABELS: Record<UserRole, { en: string; bn: string }> = {
  student: { en: "Student", bn: "শিক্ষার্থী" },
  teacher: { en: "Teacher", bn: "শিক্ষক" },
  guardian: { en: "Guardian", bn: "অভিভাবক" },
  admin: { en: "Admin", bn: "অ্যাডমিন" },
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  student: "Find the right teacher for your studies.",
  teacher: "Create a profile and get discovered by students.",
  guardian: "Manage tuition for your children.",
  admin: "Platform administration and moderation.",
};
