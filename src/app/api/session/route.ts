import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { getAdminLevel } from "@/lib/auth/admin-access";

export const dynamic = "force-dynamic";

const noStoreHeaders = { "Cache-Control": "private, no-store, max-age=0" };

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ authenticated: false }, { headers: noStoreHeaders });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ authenticated: false }, { headers: noStoreHeaders });
  }

  const [{ count }, { data: profile }] = await Promise.all([
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false),
    supabase
      .from("profiles")
      .select("role,is_super_admin,account_status")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const adminLevel = getAdminLevel(profile?.role, profile?.is_super_admin);

  return NextResponse.json(
    {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email ?? null,
        name: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null,
        role: profile?.role ?? null,
        accountStatus: profile?.account_status ?? null,
        // Omit privileged capability metadata entirely for normal accounts.
        ...(adminLevel ? { adminLevel } : {}),
      },
      unreadNotifications: count ?? 0,
    },
    { headers: noStoreHeaders },
  );
}

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");

  if (origin && new URL(origin).host !== requestUrl.host) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403, headers: noStoreHeaders });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
}
