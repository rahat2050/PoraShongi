import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import TeacherDashboardPage from "@/app/dashboard/teacher/page";
import StudentDashboardPage from "@/app/dashboard/student/page";
import GuardianDashboardPage from "@/app/dashboard/guardian/page";

export default async function DashboardIndexPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  if (profile.role === "admin") redirect("/admin");
  if (profile.role === "teacher") return <TeacherDashboardPage />;
  if (profile.role === "guardian") return <GuardianDashboardPage />;
  return <StudentDashboardPage />;
}
