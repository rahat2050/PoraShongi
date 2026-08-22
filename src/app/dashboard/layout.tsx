import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/server-auth";
import { SetupRequired } from "@/components/shared/setup-required";
import { DashboardNav } from "@/components/shared/dashboard-nav";

export const metadata: Metadata = { robots: { index: false, follow: false, nocache: true } };
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return <SetupRequired />;
  }

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await getCurrentProfile();
  if (!profile) {
    return <SetupRequired reason="profile" />;
  }

  return (
    <div className="flex flex-1 flex-col">
      {profile.role !== "admin" && (
        <div className="sticky top-[var(--header-h,4rem)] z-30 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <DashboardNav role={profile.role} />
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
