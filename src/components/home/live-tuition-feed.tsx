import Link from "next/link";
import { ArrowRight, ClipboardList, Sparkles } from "lucide-react";
import { type PublicTuitionStats, type TuitionTeaser } from "@/types/index";
import { TuitionTeaserCard } from "@/components/shared/tuition-teaser-card";
import { Reveal } from "@/components/motion/reveal";
import { buttonStyles } from "@/components/ui/button";

/**
 * Homepage feed of real open tuitions.
 *
 * সংখ্যাগুলো সরাসরি ডেটাবেস থেকে আসে — কোনো বানানো/স্ফীত পরিসংখ্যান নয়।
 * টিউশন না থাকলে পুরো সেকশনটি hide হয়ে যায় যাতে খালি জায়গা না দেখায়।
 */
export function LiveTuitionFeed({
  tuitions,
  stats,
}: {
  tuitions: TuitionTeaser[];
  stats: PublicTuitionStats | null;
}) {
  if (tuitions.length === 0) return null;

  return (
    <section className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950" aria-labelledby="live-tuitions-title">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">
              সদ্য পোস্ট হওয়া
            </p>
            <h2 id="live-tuitions-title" className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              খোলা টিউশন সুযোগ
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              অভিভাবক ও শিক্ষার্থীর পোস্ট করা সত্যিকারের টিউশন। দেখতে লগইন লাগে না — আবেদন করতে ফ্রি অ্যাকাউন্ট খুলুন।
            </p>

            {stats && (stats.new_24h > 0 || stats.open_total > 0) && (
              <div className="mt-5 flex flex-wrap gap-2">
                {stats.new_24h > 0 && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                    গত ২৪ ঘণ্টায় {stats.new_24h}টি নতুন
                  </span>
                )}
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  <ClipboardList className="h-3.5 w-3.5" aria-hidden />
                  মোট {stats.open_total}টি খোলা টিউশন
                </span>
              </div>
            )}
          </div>

          <Link href="/tuitions" className={buttonStyles({ variant: "outline", className: "shrink-0" })}>
            সব টিউশন দেখুন <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tuitions.map((tuition, index) => (
            <Reveal key={tuition.id} delay={Math.min(index * 70, 350)} className="h-full">
              <TuitionTeaserCard tuition={tuition} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
