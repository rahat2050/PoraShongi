import { BadgeCheck, MessageSquareText, Star } from "lucide-react";
import { RatingStars } from "@/components/shared/rating-stars";
import { buildRatingBreakdown } from "@/lib/ratings";
import { type ReviewPublic } from "@/types/index";

export function TeacherRatingSummary({
  average,
  total,
  reviews,
}: {
  average: number;
  total: number;
  reviews: ReviewPublic[];
}) {
  const breakdown = buildRatingBreakdown(reviews);
  const bengaliNumber = new Intl.NumberFormat("bn-BD");

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-600 dark:bg-slate-900/60">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          <Star className="h-6 w-6" aria-hidden />
        </span>
        <h3 className="mt-3 font-bold text-slate-900 dark:text-slate-100">এখনো কোনো রেটিং নেই</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">গৃহীত টিউশন অভিজ্ঞতার পর প্রথম রেটিং প্রকাশিত হবে।</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50/80 via-white to-brand-50/60 p-5 sm:grid-cols-[.75fr_1.25fr] sm:p-6 dark:border-slate-700 dark:from-amber-950/20 dark:via-slate-900 dark:to-brand-950/20">
      <div className="flex flex-col items-center justify-center text-center sm:border-r sm:border-slate-200 sm:pr-6 dark:sm:border-slate-700">
        <p className="text-5xl font-black tracking-tight text-slate-950 dark:text-white">
          {new Intl.NumberFormat("bn-BD", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(average)}
        </p>
        <RatingStars rating={average} size="lg" className="mt-2" />
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <MessageSquareText className="h-4 w-4" aria-hidden /> {bengaliNumber.format(total)}টি প্রকাশিত রিভিউ
        </p>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> গৃহীত টিউশন থেকে
        </span>
      </div>

      <div className="space-y-2.5" aria-label="রেটিং বণ্টন">
        {breakdown.sampleSize > 0 ? (
          <>
            {[5, 4, 3, 2, 1].map((rating) => {
              const key = rating as 1 | 2 | 3 | 4 | 5;
              return (
                <div key={rating} className="grid grid-cols-[2.25rem_1fr_2rem] items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 font-bold text-slate-700 dark:text-slate-200">
                    {bengaliNumber.format(rating)}<Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden />
                  </span>
                  <span className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                      style={{ width: `${breakdown.percentages[key]}%` }}
                      aria-hidden
                    />
                  </span>
                  <span className="text-right font-semibold text-slate-500 dark:text-slate-400">{bengaliNumber.format(breakdown.counts[key])}</span>
                </div>
              );
            })}
            {total > breakdown.sampleSize && (
              <p className="pt-1 text-[11px] text-slate-500 dark:text-slate-400">বণ্টনটি সর্বশেষ {bengaliNumber.format(breakdown.sampleSize)}টি প্রকাশিত রেটিং থেকে।</p>
            )}
          </>
        ) : (
          <p className="rounded-xl bg-white/70 p-4 text-center text-sm text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">বিস্তারিত রেটিং বণ্টন লোড করা যায়নি।</p>
        )}
      </div>
    </div>
  );
}
