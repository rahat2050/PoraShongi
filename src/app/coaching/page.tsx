import type { Metadata } from "next";
import Link from "next/link";
import { School } from "lucide-react";
import { listCoachingCenters } from "@/lib/data/ecosystem";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupRequired } from "@/components/shared/setup-required";
import { CoachingForm } from "@/features/ecosystem/coaching-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "কোচিং সেন্টার",
  description: "PoraSathi-তে প্রকাশিত কোচিং সেন্টার খুঁজুন।",
  robots: { index: false, follow: true },
};
export const dynamic = "force-dynamic";

export default async function CoachingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const district = typeof sp.district === "string" ? sp.district : undefined;

  if (!isSupabaseConfigured()) return <SetupRequired />;

  const profile = await getCurrentProfile();
  const canCreate = profile?.role === "teacher" || profile?.role === "admin";

  const result = await listCoachingCenters(district);
  const centers = result.data ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <School className="h-6 w-6 text-brand-600" aria-hidden />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Coaching Center</h1>
            <p className="mt-1 text-slate-500">আপনার এলাকার কোচিং সেন্টার খুঁজুন।</p>
          </div>
        </div>
        {canCreate && <CoachingForm />}
      </div>

      <div className="mt-6">
        {centers.length === 0 ? (
          <EmptyState
            icon={<School className="h-6 w-6" aria-hidden />}
            title="কোনো কোচিং সেন্টার নেই"
            description="প্রথম কোচিং সেন্টার তৈরি করুন অথবা পরে আবার দেখুন।"
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {centers.map((c) => (
              <Card key={c.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-slate-900">{c.name}</h2>
                    {c.verified && <Badge variant="success">Verified</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{[c.area, c.district].filter(Boolean).join(", ") || "এলাকা নেই"}</p>
                  {c.description && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{c.description}</p>}
                  <Link href={`/coaching/${c.id}`} className="mt-3 inline-block text-sm font-medium text-brand-700 hover:underline">
                    বিস্তারিত →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
