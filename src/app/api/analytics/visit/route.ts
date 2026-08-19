import { NextResponse, type NextRequest } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/env";
import {
  getDhakaDateKey,
  isTrackableVisitorPath,
  VISITOR_DAY_COOKIE,
} from "@/lib/analytics/visitor";

export const dynamic = "force-dynamic";

const noStoreHeaders = { "Cache-Control": "private, no-store, max-age=0" };

function hasSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",", 1)[0]?.trim();
  const requestHost = forwardedHost || request.headers.get("host") || request.nextUrl.host;
  try {
    return new URL(origin).host === requestHost;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403, headers: noStoreHeaders });
  }

  const payload = await request.json().catch(() => null) as { path?: unknown } | null;
  if (!payload || typeof payload.path !== "string" || !isTrackableVisitorPath(payload.path)) {
    return NextResponse.json({ error: "Invalid public path" }, { status: 400, headers: noStoreHeaders });
  }

  // Local/unconfigured environments remain fully usable without analytics.
  if (!isSupabaseConfigured()) return new NextResponse(null, { status: 204, headers: noStoreHeaders });

  const today = getDhakaDateKey();
  const isUniqueToday = request.cookies.get(VISITOR_DAY_COOKIE)?.value !== today;
  const db = createPublicClient(0);
  if (!db) return new NextResponse(null, { status: 204, headers: noStoreHeaders });

  const { error } = await db.rpc("record_site_visit", { p_is_unique: isUniqueToday });
  if (error) {
    console.error("[PoraSathi visitor analytics] aggregate write failed", error.code);
    return NextResponse.json({ error: "Analytics unavailable" }, { status: 503, headers: noStoreHeaders });
  }

  const response = new NextResponse(null, { status: 204, headers: noStoreHeaders });
  if (isUniqueToday) {
    response.cookies.set(VISITOR_DAY_COOKIE, today, {
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
      maxAge: 60 * 60 * 48,
    });
  }
  return response;
}
