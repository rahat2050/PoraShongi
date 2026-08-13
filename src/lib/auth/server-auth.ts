import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { type User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { type UserRole } from "@/lib/auth/roles";
import { type Profile } from "@/types/index";

/**
 * Server-side authentication & authorization helpers.
 * These are the authoritative guards for protected routes (in addition to
 * `src/proxy.ts` and database RLS).
 */

/** Returns the current Supabase user, or null when unauthenticated/unconfigured. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
});

/** Returns the current user's profile row, or null. */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !data) return null;
  return data;
});

/** Require an authenticated user; otherwise redirect to /login. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Require an authenticated user AND a profile row. */
export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}

/**
 * Require one of the given roles. Redirects non-members to /dashboard
 * (deliberately not 403 — avoids leaking the existence of admin routes).
 */
export async function requireRole(
  roles: readonly UserRole[],
): Promise<{ user: User; profile: Profile }> {
  const user = await requireUser();
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!roles.includes(profile.role)) redirect("/dashboard");
  return { user, profile };
}
