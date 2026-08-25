import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, Plus } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { listMyGigs } from "@/lib/data/gigs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { GigManageActions } from "@/features/gigs/gig-actions";
import { formatTaka } from "@/lib/utils";

export const metadata: Metadata = { title: "আমার প্যাকেজ" };

const STATUS_LABEL: Record<string, string> = {
  draft: "খসড়া",
  published: "প্রকাশিত",
  hidden: "লুকানো",
  removed: "অপসারিত",
};

export default async function MyGigsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "teacher") redirect("/dashboard");

  const result = await listMyGigs();
  const gigs = result.data ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">আমার প্যাকেজ</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">{gigs.length}টি প্যাকেজ</p>
        </div>
        <Link href="/dashboard/gigs/new" className={buttonStyles()}>
          <Plus className="h-4 w-4" aria-hidden /> নতুন প্যাকেজ
        </Link>
      </div>

      <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        প্যাকেজ হলো আপনার নিজের তৈরি fixed-price অফার — অভিভাবক টিউশন পোস্ট করার আগেই দেখতে পান
        আপনি কী পড়ান, কত সময়ে ও কত দামে। প্রকাশিত প্যাকেজ{" "}
        <Link href="/gigs" className="font-medium text-brand-700 underline dark:text-brand-300">
          প্যাকেজ তালিকায়
        </Link>{" "}
        সবার জন্য দৃশ্যমান হয়।
      </p>

      <div className="mt-6 space-y-4">
        {gigs.length === 0 ? (
          <EmptyState
            icon={<Package className="h-6 w-6" aria-hidden />}
            title="কোনো প্যাকেজ নেই"
            description="নিজের পড়ানোর একটি প্যাকেজ তৈরি করুন — অভিভাবক সরাসরি দাম ও সময়কাল দেখে সিদ্ধান্ত নিতে পারবেন।"
            action={<Link href="/dashboard/gigs/new" className={buttonStyles()}>প্যাকেজ তৈরি করুন</Link>}
          />
        ) : (
          gigs.map((gig) => (
            <Card key={gig.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/gigs/${gig.id}`}
                      className="text-base font-semibold text-slate-900 hover:text-brand-700 dark:text-slate-100"
                    >
                      {gig.title}
                    </Link>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                      {gig.subjects.join(", ") || "বিষয় নেই"} · {gig.class_levels.join(", ") || "ক্লাস নেই"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {formatTaka(gig.price)} · {gig.duration_weeks} সপ্তাহ · সপ্তাহে {gig.sessions_per_week} ক্লাস
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={gig.status === "published" ? "success" : "outline"}>
                      {STATUS_LABEL[gig.status] ?? gig.status}
                    </Badge>
                    {gig.includes_trial ? <Badge variant="outline">ফ্রি ট্রায়াল</Badge> : null}
                  </div>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <GigManageActions gigId={gig.id} status={gig.status} isFlagged={gig.is_flagged} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
