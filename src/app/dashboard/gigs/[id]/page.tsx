import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { getOwnGig } from "@/lib/data/gigs";
import { GigForm } from "@/features/gigs/gig-form";

export const metadata: Metadata = { title: "প্যাকেজ সম্পাদনা" };

export default async function EditGigPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "teacher") redirect("/dashboard");

  const { id } = await params;
  const result = await getOwnGig(id);
  const gig = result.data;

  // অন্যের gig হলে RLS সারি ফেরায় না → 404, 403 নয় (অস্তিত্ব ফাঁস না করা)।
  if (!gig) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">প্যাকেজ সম্পাদনা</h1>
      <p className="mt-1 text-sm leading-7 text-slate-500 dark:text-slate-400">
        পরিবর্তন করলে পাবলিক তালিকাতেও সাথে সাথে হালনাগাদ হবে।
      </p>
      <div className="mt-6">
        <GigForm gig={gig} />
      </div>
    </div>
  );
}
