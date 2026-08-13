import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { getTuitionById } from "@/lib/data/tuitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TuitionForm } from "@/features/tuitions/tuition-form";
import { TuitionManageActions } from "@/features/tuitions/tuition-actions";
import { TuitionStatusBadge } from "@/components/shared/status-badge";

export const metadata: Metadata = { title: "Edit tuition" };

export default async function TuitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const result = await getTuitionById(id);
  const tuition = result.data ?? null;
  if (!tuition) notFound();

  const isOwner = tuition.poster_id === profile.id;
  const isAdmin = profile.role === "admin";
  if (!isOwner && !isAdmin) redirect("/dashboard/tuitions");

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{tuition.title}</h1>
        <TuitionStatusBadge status={tuition.status} />
      </div>

      <Card className="mt-4">
        <CardContent className="flex flex-wrap gap-2 p-5">
          <TuitionManageActions tuitionId={tuition.id} status={tuition.status} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Edit tuition</CardTitle>
        </CardHeader>
        <CardContent>
          <TuitionForm tuition={tuition} />
        </CardContent>
      </Card>
    </div>
  );
}
