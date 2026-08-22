"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { RATING_LABELS } from "@/lib/ratings";
import { usePrefersReducedMotion } from "@/components/motion/reduced-motion";
import { Avatar } from "@/components/ui/avatar";
import { RatingStars } from "@/components/shared/rating-stars";
import type { TestimonialPublic } from "@/types/index";

const ROTATE_MS = 6500;

/**
 * Auto-rotating review spotlight for the homepage. Rotates through real,
 * published reviews from publishable teachers. Pauses on hover/focus, respects
 * prefers-reduced-motion (no auto-advance), and stays fully readable without JS.
 */
export function ReviewSpotlight({ reviews }: { reviews: TestimonialPublic[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const timerRef = useRef<number | null>(null);

  const count = reviews.length;
  const active = reviews[index];

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1 || paused || reducedMotion) return;

    const onVisibility = () => {
      setPaused(document.hidden);
    };
    document.addEventListener("visibilitychange", onVisibility);

    timerRef.current = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, ROTATE_MS);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, [count, paused, reducedMotion, index]);

  if (count === 0 || !active) return null;

  const displayName = active.reviewer_display_name || active.reviewer_name || "সদস্য";
  const teacherDisplayName =
    active.teacher_display_name || active.teacher_name || "শিক্ষক";
  const bengaliNumber = new Intl.NumberFormat("bn-BD");

  return (
    <section className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900" aria-labelledby="review-spotlight-title">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[.8fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
              <Quote className="h-3.5 w-3.5" aria-hidden /> বাস্তব অভিজ্ঞতা
            </span>
            <h2 id="review-spotlight-title" className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              শিক্ষার্থী ও অভিভাবকরা কী বলছেন
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-600 dark:text-slate-300">
              সত্যিকারের টিউশন শেষে দেওয়া রিভিউ — যাচাইকৃত রেটিং ও অভিজ্ঞতা থেকে সরাসরি নেওয়া।
            </p>
            <Link
              href="/teachers"
              className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-brand-800 hover:underline dark:text-brand-300"
            >
              সব শিক্ষক দেখুন <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div
            role="region"
            aria-roledescription="carousel"
            aria-label="শিক্ষার্থী ও অভিভাবকদের রিভিউ"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-7 shadow-[0_24px_70px_-40px_rgba(15,23,42,.5)] sm:p-9 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
              <div className="motion-parallax-slow pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-brand-100/70 blur-3xl dark:bg-brand-900/20" aria-hidden />
              <figure
                key={active.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${bengaliNumber.format(index + 1)} / ${bengaliNumber.format(count)}`}
                className="spotlight-in relative"
              >
                <Quote className="h-8 w-8 text-brand-200 dark:text-brand-800" aria-hidden />
                <blockquote className="mt-4 line-clamp-4 min-h-24 text-base font-medium leading-7 text-slate-700 dark:text-slate-200 sm:text-lg sm:leading-8">
                  {active.body}
                </blockquote>
                <figcaption className="mt-6 flex flex-wrap items-center gap-3">
                  <Avatar
                    src={active.reviewer_avatar}
                    name={displayName}
                    size="md"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{displayName}</span>
                      {active.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          <BadgeCheck className="h-3 w-3" aria-hidden /> গৃহীত টিউশন
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <RatingStars rating={active.rating} size="sm" />
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                        {bengaliNumber.format(active.rating)}/৫ · {RATING_LABELS[active.rating] ?? "রেটিং"}
                      </span>
                    </div>
                  </div>
                </figcaption>
                <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-200 pt-4 dark:border-slate-700">
                  <Link
                    href={`/teachers/${active.teacher_id}`}
                    className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-brand-800 hover:underline dark:text-brand-300"
                  >
                    শিক্ষক: {teacherDisplayName} <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </figure>
            </div>

            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  className="absolute -left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-lg transition hover:bg-slate-50 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-brand-300 sm:-left-5"
                  aria-label="আগের রিভিউ"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  className="absolute -right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-lg transition hover:bg-slate-50 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-brand-300 sm:-right-5"
                  aria-label="পরের রিভিউ"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
              </>
            )}

            {count > 1 && (
              <div className="mt-4 flex justify-center gap-1.5">
                {reviews.map((review, dotIndex) => (
                  <button
                    key={review.id}
                    type="button"
                    onClick={() => go(dotIndex)}
                    aria-label={`রিভিউ ${bengaliNumber.format(dotIndex + 1)} দেখুন`}
                    aria-current={dotIndex === index}
                    className={cn(
                      "h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2",
                      dotIndex === index
                        ? "w-7 bg-brand-600"
                        : "w-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500",
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
