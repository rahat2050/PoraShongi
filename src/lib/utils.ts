import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely (resolves conflicts). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Derive up to two initials from a display/full name. */
export function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Format an ISO timestamp into a readable locale string. */
export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Sanitize a user-supplied redirect target so it can only point to an
 * internal path (prevents open-redirect attacks).
 */
export function sanitizeRedirectPath(
  target: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!target) return fallback;
  if (target.startsWith("/") && !target.startsWith("//") && !target.startsWith("/\\")) {
    return target;
  }
  return fallback;
}

/** Format an ISO timestamp with time. */
export function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Format a number as Bangladeshi Taka. */
export function formatTaka(amount?: number | null): string {
  if (amount === null || amount === undefined) return "Negotiable";
  return `৳${amount.toLocaleString("en-BD")}`;
}

/** Build a query string from a params object, skipping empty values. */
export function buildQueryString(
  params: Record<string, string | number | boolean | null | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "" || value === false) {
      continue;
    }
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/** Get the first value from a searchParam that may be a string or array. */
export function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Humanize a mode value. */
export function modeLabel(mode?: string | null): string {
  if (!mode) return "—";
  if (mode === "offline") return "Offline";
  if (mode === "online") return "Online";
  if (mode === "both") return "Online & Offline";
  return mode;
}
