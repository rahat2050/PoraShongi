import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Supabase admin client using the SERVICE ROLE key.
 *
 * ⚠️ SECURITY: The service role key bypasses Row Level Security entirely.
 * This module MUST only ever be imported by server-side code. The
 * `server-only` import above makes the build fail if it is accidentally
 * imported into a Client Component bundle.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY to be set on the server. The service role key " +
        "must never be exposed to the browser.",
    );
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
