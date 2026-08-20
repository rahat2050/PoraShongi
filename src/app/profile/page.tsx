import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { getRoleProfileRow, listStudents, computeProfileCompletion } from "@/lib/data/profiles";
import { type GuardianProfile, type StudentOption, type StudentProfile, type TeacherProfile } from "@/types/index";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { Badge } from "@/components/ui/badge";
import { ProfileCompletion } from "@/components/shared/profile-completion";
import { Reveal } from "@/components/motion/reveal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BaseProfileForm } from "@/features/profile/base-profile-form";
import { StudentProfileForm } from "@/features/profile/student-profile-form";
import { TeacherProfileForm } from "@/features/profile/teacher-profile-form";
import { GuardianProfileForm } from "@/features/profile/guardian-profile-form";

export const metadata: Metadata = {
  title: "প্রোফাইল",
  robots: { index: false, follow: false, nocache: true },
};
export const dynamic = "force-dynamic";

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
          <h1 className="text-2xl font-bold text-slate-900">আপনার প্রোফাইল</h1>
          <p className="mt-1 text-slate-500">নিজের তথ্য আপডেট করুন।</p>
        </div>
        <Badge variant="brand">{ROLE_LABELS[profile.role].bn} · {ROLE_LABELS[profile.role].en}</Badge>
      </div>

      <div className="mb-6">
        <ProfileCompletion percent={completion.percent} missing={completion.missing} />
      </div>

      <div className="grid gap-6">
        <Reveal>
        <Card>
          <CardHeader><CardTitle>মৌলিক তথ্য ও প্রোফাইল ছবি</CardTitle></CardHeader>
          <CardContent><BaseProfileForm profile={profile} /></CardContent>
        </Card>
        </Reveal>

        {profile.role === "student" && (
          <Reveal delay={60}>
          <Card>
            <CardHeader><CardTitle>শিক্ষার্থী তথ্য</CardTitle></CardHeader>
            <CardContent><StudentProfileForm data={roleProfile as StudentProfile | null} /></CardContent>
          </Card>
          </Reveal>
        )}

        {profile.role === "teacher" && (
          <Reveal delay={60}>
          <Card>
            <CardHeader><CardTitle>শিক্ষক তথ্য</CardTitle></CardHeader>
            <CardContent><TeacherProfileForm data={roleProfile as TeacherProfile | null} /></CardContent>
          </Card>
          </Reveal>
        )}

        {profile.role === "guardian" && (
          <Reveal delay={60}>
          <Card>
            <CardHeader><CardTitle>অভিভাবক তথ্য</CardTitle></CardHeader>
            <CardContent><GuardianProfileForm data={roleProfile as GuardianProfile | null} students={students} /></CardContent>
          </Card>
          </Reveal>
        )}
      </div>
    </div>
  );
}
