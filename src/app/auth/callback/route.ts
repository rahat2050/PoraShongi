import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { sanitizeRedirectPath } from "@/lib/utils";

/**
 * Auth callback — handles email confirmation, password recovery and any
 * other email/OAuth link sent by Supabase Auth.
 *
 * Configure this URL (plus `/auth/callback`) as the Site URL / Redirect URL
 * in the Supabase Auth settings.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeRedirectPath(searchParams.get("next") ?? "/dashboard");

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/login?error=setup`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
