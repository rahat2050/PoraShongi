import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TuitionForm } from "@/features/tuitions/tuition-form";

export const metadata: Metadata = { title: "নতুন টিউশন" };

export default async function NewTuitionPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role === "teacher") redirect("/tuitions");
  if (profile.role === "admin") redirect("/admin");

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">টিউশন তৈরি করুন</h1>
      <p className="mt-1 text-slate-500">আপনার চাহিদাটা লিখুন।</p>
      <Card className="mt-6">
        <CardHeader><CardTitle>টিউশন তথ্য</CardTitle></CardHeader>
        <CardContent><TuitionForm /></CardContent>
      </Card>
    </div>
  );
}
