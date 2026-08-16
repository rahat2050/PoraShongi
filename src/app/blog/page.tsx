import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { listBlogPosts } from "@/lib/data/features";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupRequired } from "@/components/shared/setup-required";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonStyles } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "ব্লগ — পড়াশোনার টিপস",
  description: "SSC/HSC প্রস্তুতি, স্কলারশিপ, ক্যারিয়ার ও শিক্ষার টিপস — PoraSathi ব্লগ।",
};
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;

  const result = await listBlogPosts();
  const posts = result.data ?? [];

  const profile = await getCurrentProfile();
  const canWrite = profile?.role === "admin" || profile?.role === "teacher";

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-brand-600" aria-hidden />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">ব্লগ</h1>
            <p className="mt-1 text-slate-500">পড়াশোনার টিপস ও গাইড।</p>
          </div>
        </div>
        {canWrite && (
          <Link href="/admin/blog/new" className={buttonStyles({ size: "sm" })}>নতুন পোস্ট</Link>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {posts.length === 0 ? (
          <EmptyState icon={<BookOpen className="h-6 w-6" aria-hidden />} title="কোনো পোস্ট নেই" description="শীঘ্রই এখানে পড়াশোনার কনটেন্ট আসবে।" />
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{post.category.replace("_", " ")}</Badge>
                  <span className="text-xs text-slate-400">{formatDate(post.created_at)}</span>
                </div>
                <Link href={`/blog/${post.slug}`} className="mt-2 block text-lg font-semibold text-slate-900 hover:text-brand-700 dark:text-slate-100">
                  {post.title}
                </Link>
                {post.excerpt && <p className="mt-1.5 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{post.excerpt}</p>}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
