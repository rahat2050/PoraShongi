import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/server-auth";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupRequired } from "@/components/shared/setup-required";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { Badge } from "@/components/ui/badge";
import {
  StatusBadge,
  VerificationBadge,
} from "@/components/shared/profile-badges";
import { ProfileForm } from "@/features/profile/profile-form";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;

  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Your profile</h1>
        <p className="mt-1 text-slate-500">
          Manage your account information and profile picture.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="brand">
            {ROLE_LABELS[profile.role].en} · {ROLE_LABELS[profile.role].bn}
          </Badge>
          <StatusBadge status={profile.account_status} />
          <VerificationBadge status={profile.verification_status} />
        </div>
      </div>

      <ProfileForm profile={profile} />
    </div>
  );
}
