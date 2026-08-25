import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { GigForm } from "@/features/gigs/gig-form";

export const metadata: Metadata = { title: "নতুন প্যাকেজ" };

export default async function NewGigPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/gigs/new");
  if (profile.role !== "teacher") redirect("/dashboard");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">নতুন প্যাকেজ</h1>
      <p className="mt-1 text-sm leading-7 text-slate-500 dark:text-slate-400">
        আপনি কী পড়ান, কত সময়ে ও কত দামে — এক জায়গায় লিখে রাখুন।
      </p>
      <div className="mt-6">
        <GigForm />
      </div>
    </div>
  );
}
