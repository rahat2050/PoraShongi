import { BadgeCheck, Star } from "lucide-react";
import { type ReviewPublic } from "@/types/index";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
          aria-hidden
        />
      ))}
    </span>
  );
}

export function ReviewList({ reviews }: { reviews: ReviewPublic[] }) {
  if (reviews.length === 0) return null;

  return (
    <div className="divide-y divide-slate-100">
      {reviews.map((review) => (
        <div key={review.id} className="py-4 first:pt-0 last:pb-0">
          <div className="flex items-start gap-3">
            <Avatar
              src={review.reviewer_avatar}
              name={review.reviewer_display_name ?? review.reviewer_name ?? undefined}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-800">
                  {review.reviewer_display_name || review.reviewer_name || "Member"}
                </p>
                <Stars rating={review.rating} />
                {review.verified && (
                  <Badge variant="success">
                    <BadgeCheck className="h-3 w-3" aria-hidden />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-400">{formatDate(review.created_at)}</p>
              {review.body && (
                <p className="mt-1.5 whitespace-pre-line text-sm text-slate-600">
                  {review.body}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
