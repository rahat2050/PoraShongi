/**
 * Supabase ব্রাউজার ক্লায়েন্ট — Client Components-এ ব্যবহার করো।
 */
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase configure করা হয়নি। .env.local-এ NEXT_PUBLIC_SUPABASE_URL এবং NEXT_PUBLIC_SUPABASE_ANON_KEY বসাও।",
    );
  }
  return createBrowserClient<Database>(url, anonKey);
}
