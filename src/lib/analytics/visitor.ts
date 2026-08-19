const PRIVATE_PREFIXES = [
  "/account",
  "/admin",
  "/api",
  "/auth",
  "/dashboard",
  "/messages",
  "/profile",
  "/_next",
] as const;

export const VISITOR_DAY_COOKIE = "porasathi_visitor_day";

/** Analytics intentionally covers public product discovery only. */
export function isTrackableVisitorPath(pathname: string) {
  if (!pathname.startsWith("/") || pathname.length > 256) return false;
  const path = pathname.split("?", 1)[0];
  return !PRIVATE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

/** Calendar key used by both the HttpOnly cookie and Dhaka-time SQL aggregate. */
export function getDhakaDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
