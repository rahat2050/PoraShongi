import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server-auth";

export default async function DashboardIndexPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const target = profile.role === "admin" ? "/dashboard/teacher" : `/dashboard/${profile.role}`;
  redirect(target);
}
