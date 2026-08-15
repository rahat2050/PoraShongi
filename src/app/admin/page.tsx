import type { Metadata } from "next";
import { Flag, GraduationCap, Users } from "lucide-react";
import { adminStats } from "@/lib/data/admin";
import { StatCard } from "@/components/shared/stat-card";

export const metadata: Metadata = { title: "অ্যাডমিন ওভারভিউ" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const result = await adminStats();
  const stats = result.data;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="মোট ব্যবহারকারী" value={stats?.users ?? 0} icon={<Users className="h-5 w-5" aria-hidden />} href="/admin/users" />
        <StatCard label="শিক্ষক" value={stats?.teachers ?? 0} icon={<GraduationCap className="h-5 w-5" aria-hidden />} href="/admin/users?role=teacher" />
        <StatCard label="শিক্ষার্থী" value={stats?.students ?? 0} icon={<Users className="h-5 w-5" aria-hidden />} href="/admin/users?role=student" />
        <StatCard label="অভিভাবক" value={stats?.guardians ?? 0} icon={<Users className="h-5 w-5" aria-hidden />} href="/admin/users?role=guardian" />
        <StatCard label="খোলা রিপোর্ট" value={stats?.openReports ?? 0} icon={<Flag className="h-5 w-5" aria-hidden />} href="/admin/reports" />
      </div>
    </div>
  );
}
