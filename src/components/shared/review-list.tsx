"use client";

import { useState } from "react";
import { BadgeCheck, ChevronDown, ChevronUp, MessageSquareText } from "lucide-react";
import { type ReviewPublic } from "@/types/index";
import { RATING_LABELS } from "@/lib/ratings";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/shared/rating-stars";
import { formatDate } from "@/lib/utils";

export function ReviewList({ reviews, initialLimit = 6 }: { reviews: ReviewPublic[]; initialLimit?: number }) {
  const [expanded, setExpanded] = useState(false);
  if (reviews.length === 0) return null;

  const visibleReviews = expanded ? reviews : reviews.slice(0, initialLimit);
  const hiddenCount = Math.max(0, reviews.length - initialLimit);
  const bengaliNumber = new Intl.NumberFormat("bn-BD");

  return (
    <div>
      <div className="grid gap-3">
        {visibleReviews.map((review) => (
          <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
            <div className="flex items-start gap-3">
              <Avatar src={review.reviewer_avatar} name={review.reviewer_display_name ?? review.reviewer_name ?? undefined} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{review.reviewer_display_name || review.reviewer_name || "সদস্য"}</p>
                    {review.verified && <Badge variant="success"><BadgeCheck className="h-3 w-3" aria-hidden /> গৃহীত টিউশন</Badge>}
                  </div>
                  <time className="text-xs text-slate-500 dark:text-slate-400" dateTime={review.created_at}>{formatDate(review.created_at)}</time>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <RatingStars rating={review.rating} size="sm" />
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300">{bengaliNumber.format(review.rating)}/৫ · {RATING_LABELS[review.rating] ?? "রেটিং"}</span>
                </div>

                {review.body ? (
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300">{review.body}</p>
                ) : (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <MessageSquareText className="h-3.5 w-3.5" aria-hidden /> শুধু স্টার রেটিং দেওয়া হয়েছে
                  </p>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {hiddenCount > 0 && (
        <div className="mt-4 text-center">
          <Button type="button" variant="outline" size="sm" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
            {expanded ? <ChevronUp className="h-4 w-4" aria-hidden /> : <ChevronDown className="h-4 w-4" aria-hidden />}
            {expanded ? "কম দেখুন" : `আরও ${bengaliNumber.format(hiddenCount)}টি রিভিউ দেখুন`}
          </Button>
        </div>
      )}
    </div>
  );
}
