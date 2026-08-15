import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export function SetupRequired({ reason = "env" }: { reason?: "env" | "profile" }) {
  const isProfile = reason === "profile";

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-20">
      <Card className="w-full max-w-xl">
        <CardContent className="space-y-5 p-8">
          <Alert
            variant="warning"
            title={isProfile ? "ডাটাবেস টেবিল নেই" : "Supabase সেটআপ প্রয়োজন"}
          >
            {isProfile
              ? "আপনি লগইন করেছেন, কিন্তু profile পাওয়া যায়নি — migration চালানো হয়নি।"
              : "এই পেজ চালাতে Supabase connect করুন (README দেখুন)।"}
          </Alert>

          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
            <li>database.new → Supabase project বানান</li>
            <li>SQL Editor-এ <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">supabase/migrations</code>-এর ফাইলগুলো ক্রমে চালান</li>
            <li><code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">.env.local</code>-এ URL + anon key বসান</li>
            <li>অ্যাপ restart করুন</li>
          </ol>

          <p className="text-sm text-slate-500">
            চেক: <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/api/health</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
