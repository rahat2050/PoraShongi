import { NextResponse } from "next/server";
import { isCloudinaryConfigured, isSupabaseConfigured } from "@/lib/env";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

/** Simple health / diagnostics endpoint. */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    name: siteConfig.brandName,
    nameBangla: siteConfig.brandNameBangla,
    tagline: siteConfig.tagline,
    version: "0.1.0",
    phase: "Phase 1 — Foundation & Architecture",
    timestamp: new Date().toISOString(),
    supabaseConfigured: isSupabaseConfigured(),
    cloudinaryConfigured: isCloudinaryConfigured(),
  });
}
