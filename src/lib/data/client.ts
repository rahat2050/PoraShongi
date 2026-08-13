import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export type DbClient = SupabaseClient<Database>;

export type DataResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

/** Get a server Supabase client, or null when env is not configured. */
export async function getDb(): Promise<DbClient | null> {
  if (!isSupabaseConfigured()) return null;
  return createClient();
}

export function ok<T>(data: T): DataResult<T> {
  return { data, error: null };
}

export function fail<T>(error: string): DataResult<T> {
  return { data: null, error };
}

/** Cast an RPC Json payload to a typed value. */
export function asJson<T>(value: unknown): T {
  return value as unknown as T;
}
