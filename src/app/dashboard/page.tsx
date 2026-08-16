import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server-auth";

export default async function DashboardIndexPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  if (profile.role === "admin") redirect("/admin");
  redirect(`/dashboard/${profile.role}`);
}
