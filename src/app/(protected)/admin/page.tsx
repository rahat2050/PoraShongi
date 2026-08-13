import type { Metadata } from "next";
import {
  BadgeCheck,
  GraduationCap,
  ScrollText,
  Send,
  Users,
} from "lucide-react";
import { adminStats } from "@/lib/data/admin";
import { StatCard } from "@/components/shared/stat-card";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Admin overview" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const result = await adminStats();
  const stats = result.data;

  if (!stats) {
    return <Alert variant="danger">{result.error ?? "Could not load stats."}</Alert>;
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total users"
          value={stats.users}
          icon={<Users className="h-5 w-5" aria-hidden />}
          href="/admin/users"
        />
        <StatCard
          label="Teachers"
          value={stats.teachers}
          icon={<GraduationCap className="h-5 w-5" aria-hidden />}
          href="/admin/teachers"
        />
        <StatCard
          label="Tuitions"
          value={stats.tuitions}
          icon={<ScrollText className="h-5 w-5" aria-hidden />}
          href="/admin/tuitions"
        />
        <StatCard
          label="Tuition requests"
          value={stats.requests}
          icon={<Send className="h-5 w-5" aria-hidden />}
          href="/admin/requests"
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Students"
          value={stats.students}
          icon={<Users className="h-5 w-5" aria-hidden />}
          href="/admin/students"
        />
        <StatCard
          label="Guardians"
          value={stats.guardians}
          icon={<Users className="h-5 w-5" aria-hidden />}
          href="/admin/guardians"
        />
        <StatCard
          label="Pending verifications"
          value={stats.pendingVerifications}
          icon={<BadgeCheck className="h-5 w-5" aria-hidden />}
          href="/admin/verification"
        />
      </div>
    </div>
  );
}
