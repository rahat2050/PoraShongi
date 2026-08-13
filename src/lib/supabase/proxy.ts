import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/env";

/** Route prefixes that require an authenticated user. */
const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/admin"];

/** Auth pages that a signed-in user should not revisit. */
const AUTH_REDIRECT_PATHS = new Set(["/login", "/register", "/forgot-password"]);

/**
 * Shared session logic executed from `src/proxy.ts`.
 * Refreshes the Supabase session and applies coarse route protection.
 *
 * Note: this is only the first line of defense — every protected page also
 * re-checks the session server-side, and the database enforces RLS.
 */
export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    // Supabase not wired up yet — do not interfere with local development.
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isAuthRedirectPath = AUTH_REDIRECT_PATHS.has(pathname);

  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("next", pathname + (search || ""));
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRedirectPath) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
