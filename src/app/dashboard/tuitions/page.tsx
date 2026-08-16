import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, ScrollText } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { listTuitionsFor } from "@/lib/data/tuitions";
import { getRoleProfileRow } from "@/lib/data/profiles";
import { type GuardianProfile } from "@/types/index";
import { Card, CardContent } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TuitionStatusBadge } from "@/components/shared/status-badge";
import { TuitionManageActions } from "@/features/tuitions/tuition-actions";
import { formatTaka } from "@/lib/utils";

export const metadata: Metadata = { title: "আমার টিউশন" };

export default async function MyTuitionsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  let linkedStudentId: string | null = null;
  if (profile.role === "guardian") {
    const gp = await getRoleProfileRow(profile);
    linkedStudentId = (gp.data as GuardianProfile | null)?.linked_student_id ?? null;
  }

  const result = await listTuitionsFor(profile.id, linkedStudentId);
  const tuitions = result.data ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">আমার টিউশন</h1>
          <p className="mt-1 text-slate-500">{tuitions.length}টি টিউশন</p>
        </div>
        <Link href="/dashboard/tuitions/new" className={buttonStyles()}>
          <Plus className="h-4 w-4" aria-hidden /> নতুন টিউশন
        </Link>
      </div>

      <div className="mt-6 space-y-4">
        {tuitions.length === 0 ? (
          <EmptyState
            icon={<ScrollText className="h-6 w-6" aria-hidden />}
            title="কোনো টিউশন নেই"
            description="টিউশন তৈরি করলেই শিক্ষক খুঁজতে/পেতে পারবেন।"
            action={<Link href="/dashboard/tuitions/new" className={buttonStyles()}>টিউশন তৈরি করুন</Link>}
          />
        ) : (
          tuitions.map((t) => (
            <Card key={t.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/dashboard/tuitions/${t.id}`} className="text-base font-semibold text-slate-900 hover:text-brand-700">
                      {t.title}
                    </Link>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {t.class_level} · {t.subject} · {formatTaka(t.budget)}
                    </p>
                  </div>
                  <TuitionStatusBadge status={t.status} />
                </div>
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <TuitionManageActions tuitionId={t.id} status={t.status} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
