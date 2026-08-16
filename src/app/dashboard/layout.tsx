import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/server-auth";
import { SetupRequired } from "@/components/shared/setup-required";

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

  return <div className="flex flex-1 flex-col">{children}</div>;
}
