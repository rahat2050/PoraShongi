import { NextResponse } from "next/server";
import { isCloudinaryConfigured, isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/config/site";
import type { Tables } from "@/types/database";

export const dynamic = "force-dynamic";

/** Race a promise against a timeout so diagnostics never hang. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms),
    ),
  ]);
}

/**
 * Health / diagnostics endpoint.
 *
 * Tells you exactly what is (or isn't) configured so a broken environment is
 * easy to diagnose:
 *   - `supabaseConfigured` — env vars present?
 *   - `database` — can we reach Supabase and do the tables exist?
 */
export async function GET() {
  const payload: Record<string, unknown> = {
    status: "ok",
    name: siteConfig.brandName,
    nameBangla: siteConfig.brandNameBangla,
    tagline: siteConfig.tagline,
    version: "0.2.0",
    phase: "Phase 2 — MVP Marketplace",
    timestamp: new Date().toISOString(),
    supabaseConfigured: isSupabaseConfigured(),
    cloudinaryConfigured: isCloudinaryConfigured(),
    database: null,
  };

  if (isSupabaseConfigured()) {
    const tables: (keyof Tables)[] = [
      "profiles",
      "tuitions",
      "tuition_requests",
      "favorites",
      "notifications",
    ];

    try {
      const supabase = await createClient();
      const results = await withTimeout(
        Promise.all(
          tables.map(async (table) => {
            const { error } = await supabase
              .from(table)
              .select("id", { count: "exact", head: true });
            return [table, !error, error?.message ?? null] as const;
          }),
        ),
        6000,
      );

      const tableMap: Record<string, boolean> = {};
      let detail: string | null = null;
      for (const [table, ok, message] of results) {
        tableMap[table] = ok;
        if (!ok && !detail) detail = message;
      }

      payload.database = {
        reachable: true,
        migrationsApplied: results.every(([, ok]) => ok),
        tables: tableMap,
        detail,
      };
    } catch (err) {
      payload.database = {
        reachable: false,
        migrationsApplied: false,
        detail: err instanceof Error ? err.message : String(err),
      };
    }
  }

  return NextResponse.json(payload);
}
