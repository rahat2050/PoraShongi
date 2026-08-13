import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/env";

/**
 * Browser Supabase client — use this ONLY inside Client Components.
 * It is safe to call per render; `@supabase/ssr` memoizes the instance.
 */
export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Copy `.env.example` to `.env.local` and set " +
        "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
}
