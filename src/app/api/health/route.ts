import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

/** Supabase ঠিকমতো connect হচ্ছে কিনা দেখার জন্য। /api/health */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const envOk = Boolean(url && anonKey);

  let database: Record<string, unknown> | null = null;

  if (envOk) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${url}/rest/v1/`, {
        headers: { apikey: anonKey as string, Authorization: `Bearer ${anonKey}` },
        signal: controller.signal,
      });
      clearTimeout(timer);
      database = { reachable: true, status: res.status };
    } catch (err) {
      database = { reachable: false, detail: err instanceof Error ? err.message : String(err) };
    }
  }

  return NextResponse.json({
    status: "ok",
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
  });
}
