import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Gift } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server-auth";
import { getSiteUrl } from "@/config/site";
import { getReferralInfo } from "@/lib/data/growth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { CopyCode } from "@/features/referrals/copy-code";

export const metadata: Metadata = { title: "রেফারেল" };
export const dynamic = "force-dynamic";

export default async function ReferralsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const info = await getReferralInfo(profile.id);
  const referralUrl = info.data?.code
    ? `${getSiteUrl()}/register?ref=${encodeURIComponent(info.data.code)}`
    : "";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <Gift className="h-6 w-6 text-brand-600" aria-hidden />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">রেফারেল</h1>
          <p className="mt-1 text-slate-500">বন্ধুদের আমন্ত্রণ জানান।</p>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>আপনার রেফারেল কোড</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {info.data?.code ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-700">
                <span className="font-mono text-lg font-bold tracking-widest text-brand-700">{info.data.code}</span>
                <CopyCode code={info.data.code} referralUrl={referralUrl} />
              </div>
              <Alert variant="info">
                বন্ধু এই লিংক দিয়ে নিবন্ধন করলে রেফারেলটি আপনার অ্যাকাউন্টে গণনা হবে। কোনো আর্থিক পুরস্কারের প্রতিশ্রুতি দেওয়া হচ্ছে না।
              </Alert>
              <p className="text-sm text-slate-500">
                এখন পর্যন্ত <span className="font-semibold text-slate-800">{info.data.count}</span> জন আপনার কোড দিয়ে যুক্ত হয়েছে।
              </p>
            </>
          ) : (
            <Alert variant="warning">কোড পাওয়া যায়নি—প্রোফাইল তৈরি হয়েছে কি না দেখুন।</Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
