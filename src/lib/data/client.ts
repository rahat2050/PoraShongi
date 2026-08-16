import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/env";

export type DbClient = SupabaseClient<Database>;

export type DataResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export async function getDb(): Promise<DbClient | null> {
  if (!isSupabaseConfigured()) return null;
  return createClient();
}

export function getPublicDb(revalidateSeconds = 300): DbClient | null {
  if (!isSupabaseConfigured()) return null;
  return createPublicClient(revalidateSeconds);
}

export function ok<T>(data: T): DataResult<T> {
  return { data, error: null };
}

export function fail<T>(error: string): DataResult<T> {
  if (process.env.NODE_ENV !== "production") return { data: null, error };
  console.error("[PoraSathi data error]", error);
  return { data: null, error: "সাময়িক কারিগরি সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।" };
}

export function asJson<T>(value: unknown): T {
  return value as unknown as T;
}
