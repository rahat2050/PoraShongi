import type { Metadata } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { topTeachers } from "@/lib/data/features";
import { DISTRICTS } from "@/config/options";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupRequired } from "@/components/shared/setup-required";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { firstParam } from "@/lib/utils";

export const metadata: Metadata = { title: "সেরা শিক্ষক" };
export const dynamic = "force-dynamic";

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const district = firstParam(sp.district);

  if (!isSupabaseConfigured()) return <SetupRequired />;

  const result = await topTeachers(district, 20);
  const teachers = result.data ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-6 w-6 text-amber-500" aria-hidden />
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">সেরা শিক্ষক</h1>
          <p className="mt-1 text-slate-500">রেটিং, সম্পন্ন tuition ও রিভিউ অনুযায়ী ranking।</p>
        </div>
      </div>

      <form method="get" action="/leaderboard" className="mt-5">
        <select name="district" defaultValue={district ?? ""} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
          <option value="">সব জেলা</option>
          {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <button type="submit" className="mt-2 w-full rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700">দেখুন</button>
      </form>

      <div className="mt-6 space-y-3">
        {teachers.length === 0 ? (
          <EmptyState icon={<Trophy className="h-6 w-6" aria-hidden />} title="এখনো কোনো শিক্ষক নেই" description="শিক্ষকরা join করলে ranking দেখাবে।" />
        ) : (
          teachers.map((t, i) => {
            const name = t.display_name || t.full_name || "শিক্ষক";
            return (
              <Card key={t.id} className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <span className="w-8 text-center text-xl font-bold">{MEDALS[i] ?? `${i + 1}`}</span>
                  <Link href={`/teachers/${t.id}`}>
                    <Avatar src={t.avatar_url} name={name} size="lg" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/teachers/${t.id}`} className="truncate text-sm font-semibold text-slate-800 hover:text-brand-700 dark:text-slate-100">
                        {name}
                      </Link>
                      {t.is_premium && <Badge variant="accent">★</Badge>}
                    </div>
                    <p className="truncate text-xs text-slate-500">
                      {t.subjects?.slice(0, 3).join(", ") || "শিক্ষক"} · {t.district || "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">★ {t.rating_avg ?? "—"}</p>
                    <p className="text-xs text-slate-400">{t.completed_tuitions} টা সম্পন্ন</p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
