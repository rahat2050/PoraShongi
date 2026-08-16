import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountStatusToggle } from "@/features/account/account-status-toggle";

export const metadata: Metadata = { title: "প্রাইভেসি ও অ্যাকাউন্ট" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-brand-600" aria-hidden />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">প্রাইভেসি ও অ্যাকাউন্ট</h1>
          <p className="mt-1 text-slate-500">আপনার অ্যাকাউন্ট ও গোপনীয়তা নিয়ন্ত্রণ।</p>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>অ্যাকাউন্ট স্ট্যাটাস</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">
            {profile.account_status === "deleted"
              ? "আপনার অ্যাকাউন্ট এখন নিষ্ক্রিয় — প্রোফাইল কেউ দেখতে পাবে না।"
              : "আপনার অ্যাকাউন্ট সক্রিয়। চাইলে যেকোনো সময় নিষ্ক্রিয় করতে পারবেন (ডাটা মুছবে না)।"}
          </p>
          <AccountStatusToggle current={profile.account_status === "deleted" ? "deleted" : "active"} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>গোপনীয়তা</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>• আপনার ফোন নম্বর কখনো পাবলিক হয় না — শুধু যোগাযোগ অনুরোধ accept করলে দেখা যায়।</p>
          <p>• নাবালক (১৮ বছরের কম) শিক্ষার্থীর এলাকা সব জায়গায় লুকানো থাকে।</p>
          <p>• অন্য ব্যবহারকারী আপনার প্রোফাইল/মেসেজ/রিভিউ দেখতে পারে না (Row Level Security)।</p>
        </CardContent>
      </Card>
    </div>
  );
}
