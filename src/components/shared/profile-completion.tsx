import Link from "next/link";
import { cn } from "@/lib/utils";

export function ProfileCompletion({
  percent,
  missing,
}: {
  percent: number;
  missing: string[];
}) {
  const color = percent >= 80 ? "bg-emerald-500" : percent >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">প্রোফাইল সম্পূর্ণতা</h3>
        <span className="text-sm font-bold text-slate-700">{percent}%</span>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${percent}%` }} />
      </div>
      {missing.length > 0 ? (
        <div className="mt-3">
          <p className="text-xs text-slate-500">যেগুলো বাকি:</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {missing.slice(0, 6).map((item) => (
              <span key={item} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{item}</span>
            ))}
          </div>
          <Link href="/profile" className="mt-3 inline-block text-sm font-medium text-brand-700 hover:underline">
            প্রোফাইল সম্পূর্ণ করুন →
          </Link>
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-500">আপনার প্রোফাইল সম্পূর্ণ! 🎉</p>
      )}
    </div>
  );
}
