import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ExternalLink } from "lucide-react";
import { listEducationResources } from "@/lib/data/ecosystem";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { firstParam, formatTaka } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonStyles } from "@/components/ui/button";

export const metadata: Metadata = { title: "শিক্ষা রিসোর্স", description: "শিক্ষকদের শেয়ার করা link-based শিক্ষা রিসোর্স।", alternates: { canonical: "/resources" } };
export const revalidate = 300;

export default async function ResourcesPage({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  const subject = firstParam((await searchParams).subject);
  const [result, profile] = await Promise.all([listEducationResources(subject), getCurrentProfile()]);
  const canAdd = profile?.role === "teacher" || profile?.role === "admin" || profile?.is_super_admin;
  const rows = result.data ?? [];
  return <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">শিক্ষা রিসোর্স</h1><p className="mt-1 text-slate-500">Notes, guide ও learning material-এর নিরাপদ external link।</p></div>{canAdd && <Link href="/dashboard/resources/new" className={buttonStyles()}>Resource যোগ করুন</Link>}</div>
    <div className="mt-6">{result.error ? <EmptyState title="Resource লোড হয়নি" description={result.error}/> : rows.length===0 ? <EmptyState icon={<BookOpen className="h-6 w-6"/>} title="কোনো resource নেই" description="শিক্ষকরা resource যোগ করলে এখানে দেখাবে।"/> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{rows.map(r=><Card key={r.id}><CardContent className="p-5"><div className="flex flex-wrap gap-1.5">{r.subject&&<Badge variant="brand">{r.subject}</Badge>}{r.class_level&&<Badge variant="outline">{r.class_level}</Badge>}</div><h2 className="mt-3 font-semibold text-slate-900 dark:text-slate-100">{r.title}</h2>{r.description&&<p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{r.description}</p>}<div className="mt-4 flex items-center justify-between border-t pt-3"><span className="text-sm font-bold">{r.price ? formatTaka(r.price) : "ফ্রি"}</span><a href={r.resource_url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">খুলুন <ExternalLink className="h-4 w-4"/></a></div></CardContent></Card>)}</div>}</div>
  </div>;
}
