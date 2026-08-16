import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBlogPost } from "@/lib/data/features";
import { Card, CardContent } from "@/components/ui/card";
import { ShareButtons } from "@/components/shared/share-buttons";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = (await getBlogPost(slug)).data;
    if (!post) return { title: "ব্লগ" };
    return {
      title: post.title,
      description: post.excerpt ?? post.title,
    };
  } catch {
    return { title: "ব্লগ" };
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = (await getBlogPost(slug)).data;
  if (!post) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <Link href="/blog" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" aria-hidden /> সব পোস্ট
      </Link>

      <Card>
        <CardContent className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{post.title}</h1>
          <p className="mt-2 text-xs text-slate-400">{formatDate(post.created_at)} · {post.category.replace("_", " ")}</p>
          <div className="mt-5 whitespace-pre-line text-base leading-relaxed text-slate-700 dark:text-slate-300">
            {post.content}
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
            <p className="text-xs text-slate-400">শেয়ার করুন:</p>
            <ShareButtons
              url={`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/blog/${post.slug}`}
              title={post.title}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
