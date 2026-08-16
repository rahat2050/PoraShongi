import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Anonymous server-only client for data that is intentionally public.
 * It never reads auth cookies, so public pages can use Next's data cache.
 */
export function createPublicClient(revalidateSeconds = 300) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const cachedFetch: typeof fetch = (input, init) =>
    fetch(input, {
      ...init,
      next: { revalidate: revalidateSeconds },
    } as RequestInit & { next: { revalidate: number } });

  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: cachedFetch },
  });
}
