import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/server-auth";
import { SetupRequired } from "@/components/shared/setup-required";
import { Alert } from "@/components/ui/alert";

/**
 * Protected route group — every page under /dashboard, /profile and /admin
 * re-verifies the session server-side (defense in depth on top of proxy.ts
 * and database RLS).
 */
export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No Supabase env vars — nothing can work; show setup steps.
  if (!isSupabaseConfigured()) {
    return <SetupRequired />;
  }

  // Not signed in — send to the login page.
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Signed in but no profile row — the database migrations haven't been
  // applied (or the signup trigger didn't run). Show instructions instead of
  // bouncing back to /login in a loop.
  const profile = await getCurrentProfile();
  if (!profile) {
    return <SetupRequired reason="profile" />;
  }

  return (
    <div className="flex flex-1 flex-col">
      {profile.account_status === "suspended" && (
        <div className="border-b border-amber-200 bg-amber-50">
          <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
            <Alert variant="warning">
              Your account is currently suspended. Some features may be
              unavailable.
            </Alert>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
