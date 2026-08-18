import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { listSavedTuitions } from "@/lib/data/saved-tuitions";
import { SavedTuitionGrid } from "@/features/favorites/saved-tuition-grid";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "সেভ করা টিউশন" };
export const dynamic = "force-dynamic";

export default async function SavedTuitionsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=%2Fdashboard%2Fsaved-tuitions");
  if (profile.role !== "teacher") redirect("/dashboard");

  const result = await listSavedTuitions(profile.id);
  const tuitions = result.data ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
            <Bookmark className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">সেভ করা টিউশন</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">পছন্দের টিউশন সুযোগগুলো এক জায়গায় দেখুন—সর্বোচ্চ ৩০টি।</p>
          </div>
        </div>
        <Badge variant="brand">{new Intl.NumberFormat("bn-BD").format(tuitions.length)}টি সেভ করা</Badge>
      </div>

      <div className="mt-6">
        {result.error ? (
          <Alert variant="danger" title="সেভ করা টিউশন লোড হয়নি">{result.error}</Alert>
        ) : (
          <SavedTuitionGrid initialTuitions={tuitions} />
        )}
      </div>
    </div>
  );
}
