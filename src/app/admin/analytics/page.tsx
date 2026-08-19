import type { Metadata } from "next";
import {
  BarChart3,
  CalendarDays,
  Eye,
  GraduationCap,
  MousePointerClick,
  Percent,
  ScrollText,
  Send,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { adminAnalytics, superAdminVisitorAnalytics } from "@/lib/data/features";
import { requireAdmin } from "@/lib/auth/server-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import type { SuperAdminVisitorAnalytics } from "@/types/index";

export const metadata: Metadata = { title: "অ্যাডমিন — পরিসংখ্যান" };
export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const profile = await requireAdmin();
  const [result, visitorResult] = await Promise.all([
    adminAnalytics(),
    profile.is_super_admin ? superAdminVisitorAnalytics(14) : Promise.resolve(null),
  ]);
  const a = result.data;

  if (!a) {
    return <Card><CardContent className="p-6 text-sm text-red-600">{result.error ?? "পরিসংখ্যান লোড হয়নি।"}</CardContent></Card>;
  }

  const maxSubject = Math.max(1, ...a.top_subjects.map((s) => s.c));
  const maxDistrict = Math.max(1, ...a.top_districts.map((d) => d.c));

  return (
    <div>
      {profile.is_super_admin && (
        visitorResult?.data ? (
          <VisitorAnalyticsPanel analytics={visitorResult.data} />
        ) : (
          <Card className="mb-8 border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
            <CardContent className="flex gap-3 p-5 text-sm text-amber-900 dark:text-amber-100">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              <div>
                <p className="font-bold">ভিজিটর অ্যানালিটিক্স এখন লোড করা যাচ্ছে না</p>
                <p className="mt-1 leading-6">Database migration 0029 সক্রিয় হওয়ার পর privacy-safe visitor count এখানে দেখা যাবে।</p>
              </div>
            </CardContent>
          </Card>
        )
      )}

      <section aria-labelledby="marketplace-analytics-title">
        <h2 id="marketplace-analytics-title" className="mb-4 text-xl font-bold text-slate-900 dark:text-white">মার্কেটপ্লেস পরিসংখ্যান</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="মোট ব্যবহারকারী" value={a.users} icon={<Users className="h-5 w-5" aria-hidden />} />
          <StatCard label="শিক্ষক" value={a.teachers} icon={<GraduationCap className="h-5 w-5" aria-hidden />} />
          <StatCard label="শিক্ষার্থী" value={a.students} icon={<Users className="h-5 w-5" aria-hidden />} />
          <StatCard label="টিউশন" value={a.tuitions} icon={<ScrollText className="h-5 w-5" aria-hidden />} />
          <StatCard label="অনুরোধ" value={a.requests} icon={<Send className="h-5 w-5" aria-hidden />} />
          <StatCard label="রিভিউ" value={a.reviews} icon={<Star className="h-5 w-5" aria-hidden />} />
        </div>
      </section>

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
              <p className="text-sm text-slate-500 dark:text-slate-400">কোনো ডাটা নেই।</p>
            ) : (
              a.top_subjects.map((s) => (
                <div key={s.subject}>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-700 dark:text-slate-200">{s.subject}</span>
                    <span className="text-slate-500 dark:text-slate-400">{s.c}</span>
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
              <p className="text-sm text-slate-500 dark:text-slate-400">কোনো ডাটা নেই।</p>
            ) : (
              a.top_districts.map((d) => (
                <div key={d.district}>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-700 dark:text-slate-200">{d.district}</span>
                    <span className="text-slate-500 dark:text-slate-400">{d.c}</span>
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

      <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
        <BarChart3 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        মার্কেটপ্লেসের হিসাব বিদ্যমান তথ্য থেকে তৈরি। Visitor analytics শুধু দৈনিক aggregate count সংরক্ষণ করে; কোনো IP, device identity বা browsing history রাখা হয় না।
      </p>
    </div>
  );
}

function VisitorAnalyticsPanel({ analytics }: { analytics: SuperAdminVisitorAnalytics }) {
  const maxValue = Math.max(
    1,
    ...analytics.daily.flatMap((item) => [item.visitors, item.page_views]),
  );

  return (
    <section className="mb-10" aria-labelledby="visitor-analytics-title" data-super-admin-visitor-analytics>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="visitor-analytics-title" className="text-xl font-bold text-slate-900 dark:text-white">ভিজিটর অ্যানালিটিক্স</h2>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-200">শুধু Super Admin</span>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Public পেজে আসা privacy-safe দৈনিক visitor ও page-view হিসাব।</p>
        </div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">সর্বমোট page view: {analytics.all_time.page_views.toLocaleString("bn-BD")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="আজকের ইউনিক ভিজিটর" value={analytics.today.visitors.toLocaleString("bn-BD")} icon={<Eye className="h-5 w-5" aria-hidden />} />
        <StatCard label="আজকের পেজ ভিউ" value={analytics.today.page_views.toLocaleString("bn-BD")} icon={<MousePointerClick className="h-5 w-5" aria-hidden />} />
        <StatCard label="গত ৭ দিনের ভিজিটর" value={analytics.last_7_days.visitors.toLocaleString("bn-BD")} icon={<CalendarDays className="h-5 w-5" aria-hidden />} />
        <StatCard label="গত ৩০ দিনের ভিজিটর" value={analytics.last_30_days.visitors.toLocaleString("bn-BD")} icon={<BarChart3 className="h-5 w-5" aria-hidden />} />
      </div>

      <Card className="mt-6 overflow-hidden">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>গত ১৪ দিনের ট্রেন্ড</CardTitle>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">সবুজ: visitor · অ্যাম্বার: page view</p>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800 dark:bg-brand-950 dark:text-brand-200">Dhaka time</span>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="scrollbar-none overflow-x-auto" aria-hidden>
            <div className="flex h-52 min-w-[680px] items-end gap-3 border-b border-slate-200 px-1 pb-2 dark:border-slate-700">
              {analytics.daily.map((item) => {
                const visitorHeight = item.visitors > 0 ? Math.max(6, (item.visitors / maxValue) * 100) : 2;
                const viewHeight = item.page_views > 0 ? Math.max(6, (item.page_views / maxValue) * 100) : 2;
                return (
                  <div key={item.date} className="flex h-full min-w-9 flex-1 flex-col justify-end text-center">
                    <div className="mb-1 text-[10px] font-bold text-slate-600 dark:text-slate-300">{item.visitors}/{item.page_views}</div>
                    <div className="flex h-36 items-end justify-center gap-1">
                      <span className="w-2.5 rounded-t-full bg-brand-600" style={{ height: `${visitorHeight}%` }} />
                      <span className="w-2.5 rounded-t-full bg-amber-500" style={{ height: `${viewHeight}%` }} />
                    </div>
                    <span className="mt-2 whitespace-nowrap text-[10px] text-slate-500 dark:text-slate-400">{formatVisitorDate(item.date)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <table className="sr-only">
            <caption>গত ১৪ দিনের visitor ও page-view হিসাব</caption>
            <thead><tr><th>তারিখ</th><th>ভিজিটর</th><th>পেজ ভিউ</th></tr></thead>
            <tbody>
              {analytics.daily.map((item) => (
                <tr key={item.date}><td>{item.date}</td><td>{item.visitors}</td><td>{item.page_views}</td></tr>
              ))}
            </tbody>
          </table>

          <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
            একই browser-কে একই দিনে একবার visitor ধরা হয়; পরের দিনে এলে আবার নতুন দৈনিক visitor হিসেবে গণনা হয়। Automated browser, private route এবং Do Not Track ব্যবহারকারী count হয় না।
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

function formatVisitorDate(value: string) {
  return new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Dhaka",
  }).format(new Date(`${value}T00:00:00+06:00`));
}
