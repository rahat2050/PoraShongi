import "server-only";
/**
 * Supabase সার্ভার ক্লায়েন্ট — Server Components, Route Handlers,
 * Server Actions-এ ব্যবহার করো (cookie-based session)।
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase configure করা হয়নি। .env.local-এ NEXT_PUBLIC_SUPABASE_URL এবং NEXT_PUBLIC_SUPABASE_ANON_KEY বসাও।",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Component-এ কল হলে ignore করা নিরাপদ (proxy session refresh করে)
        }
      },
    },
  });
}
