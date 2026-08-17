import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

/** Lightweight end-to-end health check for Vercel + the public Supabase API. */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const envOk = Boolean(url && anonKey);
  let database: Record<string, unknown> = { reachable: false, status: null, check: "site_stats" };

  if (envOk) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch(`${url}/rest/v1/rpc/site_stats`, {
        method: "POST",
        headers: {
          apikey: anonKey as string,
          Authorization: `Bearer ${anonKey}`,
          "Content-Type": "application/json",
        },
        body: "{}",
        cache: "no-store",
        signal: controller.signal,
      });
      database = { reachable: response.ok, status: response.status, check: "site_stats" };
    } catch (error) {
      database = {
        reachable: false,
        status: null,
        check: "site_stats",
        detail: error instanceof Error && error.name === "AbortError" ? "timeout" : "request_failed",
      };
    } finally {
      clearTimeout(timer);
    }
  }

  const healthy = envOk && database.reachable === true;
  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      name: siteConfig.brandName,
      nameBangla: siteConfig.brandNameBangla,
      tagline: siteConfig.tagline,
      branding: siteConfig.branding,
      version: "0.1.0",
      phase: "BP1+BP2+FP1",
      timestamp: new Date().toISOString(),
      supabaseEnvConfigured: envOk,
      supabaseUrl: url ? "set" : "missing",
      database,
    },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
