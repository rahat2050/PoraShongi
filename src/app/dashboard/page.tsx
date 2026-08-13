import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { buttonStyles } from "@/components/ui/button";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto w-full max-w-xl flex-1 px-4 py-20">
        <Card>
          <CardContent className="space-y-4 p-8">
            <Alert variant="warning" title="Supabase setup প্রয়োজন">
              Dashboard চালাতে Supabase connect করুন (README দেখুন)।
            </Alert>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
              <li>database.new → Supabase project বানান</li>
              <li>SQL Editor-এ supabase/migrations-এর ২টা ফাইল চালান</li>
              <li>.env.local-এ URL + anon key বসান</li>
              <li>অ্যাপ restart করুন</li>
            </ol>
            <p className="text-sm text-slate-500">
              চেক করতে: <Link href="/api/health" className="text-brand-700 underline">/api/health</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-slate-900">স্বাগতম! 👋</h1>
      <p className="mt-3 text-slate-600">
        আপনি লগইন করেছেন: <span className="font-medium">{user.email}</span>
      </p>
      <p className="mt-2 text-sm text-slate-500">
        Dashboard-এর সম্পূর্ণ feature (profile, tuition, search, request) Frontend Phase 2-তে যোগ হবে।
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/teachers" className={buttonStyles()}>শিক্ষক খুঁজুন</Link>
        <Link href="/profile" className={buttonStyles({ variant: "outline" })}>প্রোফাইল</Link>
      </div>
    </div>
  );
}
