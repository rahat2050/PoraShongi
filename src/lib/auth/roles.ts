export const USER_ROLES = ["student", "teacher", "guardian", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const REGISTERABLE_ROLES = ["student", "teacher", "guardian"] as const;

export const ROLE_LABELS: Record<UserRole, { en: string; bn: string }> = {
  student: { en: "Student", bn: "শিক্ষার্থী" },
  teacher: { en: "Teacher", bn: "শিক্ষক" },
  guardian: { en: "Guardian", bn: "অভিভাবক" },
  admin: { en: "Admin", bn: "অ্যাডমিন" },
};
