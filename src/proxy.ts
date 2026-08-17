import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/env";
import { hasAdminAccess } from "@/lib/auth/admin-access";

const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/admin", "/messages", "/account"];

/**
 * Next.js 16 proxy (আগের middleware) — Supabase session refresh +
 * protected route guard।
 */
export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  if (pathname === "/admin/blog/new") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/blog/new";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isProtected && pathname !== "/account") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_status,role,is_super_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (profile && profile.account_status !== "active") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/account";
      redirectUrl.search = "";
      redirectUrl.searchParams.set("inactive", profile.account_status);
      return NextResponse.redirect(redirectUrl);
    }

    if (
      profile
      && (pathname === "/admin" || pathname.startsWith("/admin/"))
      && !hasAdminAccess(profile.role, profile.is_super_admin)
    ) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff2?)$).*)",
  ],
};
