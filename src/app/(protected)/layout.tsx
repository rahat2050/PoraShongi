import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentProfile } from "@/lib/auth/server-auth";
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
  if (!isSupabaseConfigured()) {
    return <SetupRequired />;
  }

  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

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
