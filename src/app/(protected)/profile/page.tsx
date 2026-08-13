import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import {
  getRoleProfileRow,
  listStudents,
  computeProfileCompletion,
  type StudentOption,
} from "@/lib/data/profiles";
import {
  type GuardianProfile,
  type StudentProfile,
  type TeacherProfile,
} from "@/types/index";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { Badge } from "@/components/ui/badge";
import {
  StatusBadge,
  VerificationBadge,
} from "@/components/shared/profile-badges";
import { ProfileCompletion } from "@/components/shared/profile-completion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BaseProfileForm } from "@/features/profile/base-profile-form";
import { StudentProfileForm } from "@/features/profile/student-profile-form";
import { TeacherProfileForm } from "@/features/profile/teacher-profile-form";
import { GuardianProfileForm } from "@/features/profile/guardian-profile-form";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const roleResult = await getRoleProfileRow(profile);
  const roleProfile = roleResult.data;
  const completion = computeProfileCompletion(profile, roleProfile);

  let students: StudentOption[] = [];
  if (profile.role === "guardian") {
    students = (await listStudents()).data ?? [];
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your profile</h1>
          <p className="mt-1 text-slate-500">
            Manage your account and role-specific information.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="brand">
            {ROLE_LABELS[profile.role].en} · {ROLE_LABELS[profile.role].bn}
          </Badge>
          <StatusBadge status={profile.account_status} />
          <VerificationBadge status={profile.verification_status} />
        </div>
      </div>

      <div className="mb-6">
        <ProfileCompletion
          percent={completion.percent}
          missing={completion.missing}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account information</CardTitle>
          </CardHeader>
          <CardContent>
            <BaseProfileForm profile={profile} />
          </CardContent>
        </Card>

        {profile.role === "student" && (
          <Card>
            <CardHeader>
              <CardTitle>Student details</CardTitle>
            </CardHeader>
            <CardContent>
              <StudentProfileForm data={roleProfile as StudentProfile | null} />
            </CardContent>
          </Card>
        )}

        {profile.role === "teacher" && (
          <Card>
            <CardHeader>
              <CardTitle>Teacher details</CardTitle>
            </CardHeader>
            <CardContent>
              <TeacherProfileForm data={roleProfile as TeacherProfile | null} />
            </CardContent>
          </Card>
        )}

        {profile.role === "guardian" && (
          <Card>
            <CardHeader>
              <CardTitle>Guardian details</CardTitle>
            </CardHeader>
            <CardContent>
              <GuardianProfileForm
                data={roleProfile as GuardianProfile | null}
                students={students}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
