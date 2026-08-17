export type AdminLevel = "admin" | "super_admin";

/**
 * Admin capability is derived only from the trusted database profile.
 * Super-admin remains a capability, not a replacement for the user's
 * teacher/student/guardian role.
 */
export function getAdminLevel(
  role: string | null | undefined,
  isSuperAdmin: boolean | null | undefined,
): AdminLevel | null {
  if (isSuperAdmin === true) return "super_admin";
  if (role === "admin") return "admin";
  return null;
}

export function hasAdminAccess(
  role: string | null | undefined,
  isSuperAdmin: boolean | null | undefined,
): boolean {
  return getAdminLevel(role, isSuperAdmin) !== null;
}
