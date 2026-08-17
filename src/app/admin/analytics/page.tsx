import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { adminAnalytics } from "@/lib/data/features";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { Users, GraduationCap, ScrollText, Send, Star, Percent } from "lucide-react";

export const metadata: Metadata = { title: "অ্যাডমিন — পরিসংখ্যান" };
export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const result = await adminAnalytics();
  const a = result.data;

  if (!a) {
    return <Card><CardContent className="p-6 text-sm text-red-600">{result.error ?? "পরিসংখ্যান লোড হয়নি।"}</CardContent></Card>;
  }

  const maxSubject = Math.max(1, ...a.top_subjects.map((s) => s.c));
  const maxDistrict = Math.max(1, ...a.top_districts.map((d) => d.c));

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="মোট ব্যবহারকারী" value={a.users} icon={<Users className="h-5 w-5" aria-hidden />} />
        <StatCard label="শিক্ষক" value={a.teachers} icon={<GraduationCap className="h-5 w-5" aria-hidden />} />
        <StatCard label="শিক্ষার্থী" value={a.students} icon={<Users className="h-5 w-5" aria-hidden />} />
        <StatCard label="টিউশন" value={a.tuitions} icon={<ScrollText className="h-5 w-5" aria-hidden />} />
        <StatCard label="অনুরোধ" value={a.requests} icon={<Send className="h-5 w-5" aria-hidden />} />
        <StatCard label="রিভিউ" value={a.reviews} icon={<Star className="h-5 w-5" aria-hidden />} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-brand-600" aria-hidden />
            মিলের হার: {a.match_rate}% ({a.accepted}/{a.requests} গৃহীত)
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>জনপ্রিয় বিষয়</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {a.top_subjects.length === 0 ? (
              <p className="text-sm text-slate-400">কোনো ডাটা নেই।</p>
            ) : (
              a.top_subjects.map((s) => (
                <div key={s.subject}>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-700 dark:text-slate-200">{s.subject}</span>
                    <span className="text-slate-400">{s.c}</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700">
                    <div className="h-2 rounded-full bg-brand-500" style={{ width: `${(s.c / maxSubject) * 100}%` }} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>জনপ্রিয় জেলা</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {a.top_districts.length === 0 ? (
              <p className="text-sm text-slate-400">কোনো ডাটা নেই।</p>
            ) : (
              a.top_districts.map((d) => (
                <div key={d.district}>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-700 dark:text-slate-200">{d.district}</span>
                    <span className="text-slate-400">{d.c}</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700">
                    <div className="h-2 rounded-full bg-accent-500" style={{ width: `${(d.c / maxDistrict) * 100}%` }} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <p className="mt-6 flex items-center gap-2 text-xs text-slate-400">
        <BarChart3 className="h-4 w-4" aria-hidden />
        সব হিসাব বিদ্যমান তথ্য থেকে হিসাব করা হয়েছে; অতিরিক্ত তথ্য সংরক্ষণ করা হয় না।
      </p>
    </div>
  );
}
