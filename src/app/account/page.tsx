import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Crown, Download, ShieldCheck, Trash2 } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { AccountStatusToggle } from "@/features/account/account-status-toggle";
import { ChangePasswordForm } from "@/features/account/change-password-form";
import { buttonStyles } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "প্রাইভেসি ও অ্যাকাউন্ট",
  robots: { index: false, follow: false, nocache: true },
};
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=%2Faccount");

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
          {profile.account_status === "suspended" ? (
            <Alert variant="danger" title="অ্যাকাউন্ট স্থগিত">
              নিরাপত্তা বা নীতিমালা পর্যালোচনার কারণে অ্যাকাউন্টটি স্থগিত আছে। পুনর্বিবেচনার জন্য hello@porasathi.com-এ যোগাযোগ করুন।
            </Alert>
          ) : profile.account_status === "pending" ? (
            <Alert variant="warning" title="অ্যাকাউন্ট পর্যালোচনাধীন">
              পর্যালোচনা শেষ না হওয়া পর্যন্ত কিছু ফিচার ব্যবহার করা যাবে না।
            </Alert>
          ) : (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {profile.account_status === "deleted"
                  ? "আপনার অ্যাকাউন্ট এখন নিষ্ক্রিয়—প্রোফাইল কেউ দেখতে পাবে না।"
                  : "আপনার অ্যাকাউন্ট সক্রিয়। চাইলে যেকোনো সময় নিষ্ক্রিয় করতে পারবেন; তথ্য মুছে যাবে না।"}
              </p>
              <AccountStatusToggle current={profile.account_status === "deleted" ? "deleted" : "active"} />
            </>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>পাসওয়ার্ড বদলান</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card><CardContent className="p-5"><Crown className="h-5 w-5 text-amber-600"/><h2 className="mt-2 font-semibold">Premium</h2><p className="mt-1 text-sm text-slate-500">৳১০০ / ৩০ দিন—Admin-এর সঙ্গে WhatsApp-এ যোগাযোগ করুন।</p><Link href="/premium" className={buttonStyles({variant:"outline",size:"sm",className:"mt-4"})}>বিস্তারিত</Link></CardContent></Card>
        <Card><CardContent className="p-5"><Download className="h-5 w-5 text-brand-700"/><h2 className="mt-2 font-semibold">নিজের ডেটা Export</h2><p className="mt-1 text-sm text-slate-500">JSON বা CSV সরাসরি download করুন।</p><Link href="/account/export" className={buttonStyles({variant:"outline",size:"sm",className:"mt-4"})}>Export</Link></CardContent></Card>
        <Card><CardContent className="p-5"><Trash2 className="h-5 w-5 text-red-600"/><h2 className="mt-2 font-semibold">Permanent Delete</h2><p className="mt-1 text-sm text-slate-500">Private data ও login স্থায়ীভাবে সরান।</p><Link href="/account/delete" className={buttonStyles({variant:"danger",size:"sm",className:"mt-4"})}>Delete options</Link></CardContent></Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>গোপনীয়তা</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>• আপনার ফোন নম্বর কখনো পাবলিক হয় না — শুধু যোগাযোগের অনুরোধ গ্রহণ করলে দেখা যায়।</p>
          <p>• নাবালক (১৮ বছরের কম) শিক্ষার্থীর এলাকা সব জায়গায় লুকানো থাকে।</p>
          <p>• আপনার ব্যক্তিগত মেসেজ ও অ্যাকাউন্ট তথ্য অনুমতি ছাড়া অন্য ব্যবহারকারী দেখতে পারে না।</p>
        </CardContent>
      </Card>
    </div>
  );
}
