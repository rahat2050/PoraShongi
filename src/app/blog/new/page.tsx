import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlogForm } from "@/features/blog/blog-form";

export const metadata: Metadata = {
  title: "নতুন ব্লগ পোস্ট",
  robots: { index: false, follow: false, nocache: true },
};
export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=%2Fblog%2Fnew");
  if (profile.role !== "admin" && profile.role !== "teacher") redirect("/dashboard");

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">নতুন ব্লগ পোস্ট</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">শিক্ষার্থী ও অভিভাবকদের জন্য শিক্ষামূলক লেখা প্রকাশ করুন।</p>
      <Card className="mt-6">
        <CardHeader><CardTitle>পোস্ট লিখুন</CardTitle></CardHeader>
        <CardContent><BlogForm /></CardContent>
      </Card>
    </div>
  );
}
