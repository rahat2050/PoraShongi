import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Mail, MapPin, ShieldCheck } from "lucide-react";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/server-auth";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupRequired } from "@/components/shared/setup-required";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/auth/roles";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  StatusBadge,
  VerificationBadge,
} from "@/components/shared/profile-badges";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;

  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const displayName =
    profile.full_name || profile.display_name || user.email || "there";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar
            src={profile.avatar_url}
            name={displayName}
            size="lg"
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome, {displayName} 👋
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="brand">
                {ROLE_LABELS[profile.role].en} · {ROLE_LABELS[profile.role].bn}
              </Badge>
              <StatusBadge status={profile.account_status} />
              <VerificationBadge status={profile.verification_status} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/profile"
            className={buttonStyles({ variant: "outline" })}
          >
            Edit profile
          </Link>
          {profile.role === "admin" && (
            <Link href="/admin" className={buttonStyles({ variant: "secondary" })}>
              Admin panel
            </Link>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <ShieldCheck className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <p className="text-sm text-slate-500">Your role</p>
              <p className="font-semibold text-slate-900">
                {ROLE_LABELS[profile.role].en}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <CalendarDays className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <p className="text-sm text-slate-500">Member since</p>
              <p className="font-semibold text-slate-900">
                {formatDate(profile.created_at)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <MapPin className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <p className="text-sm text-slate-500">Location</p>
              <p className="font-semibold text-slate-900">
                {profile.location || "Not set"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
            <CardDescription>Your PoraShongi profile at a glance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <DetailRow
              icon={<Mail className="h-4 w-4" aria-hidden />}
              label="Email"
              value={user.email ?? "—"}
            />
            <DetailRow
              icon={<ShieldCheck className="h-4 w-4" aria-hidden />}
              label="Role description"
              value={ROLE_DESCRIPTIONS[profile.role]}
            />
            <DetailRow
              icon={<MapPin className="h-4 w-4" aria-hidden />}
              label="Location"
              value={profile.location || "Not set"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Foundation status</CardTitle>
            <CardDescription>
              What Phase 1 gives every account right now.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600">
              {[
                "Secure authentication & session handling",
                "Role-aware access control",
                "Private profile with avatar support",
                "Admin dashboard for platform staff",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 text-brand-600">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-slate-400">{icon}</span>
      <span className="w-32 shrink-0 text-slate-500">{label}</span>
      <span className="truncate font-medium text-slate-800">{value}</span>
    </div>
  );
}
