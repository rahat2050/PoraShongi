import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const sizes = {
  sm: { icon: "h-4 w-4", gap: "gap-0.5" },
  md: { icon: "h-5 w-5", gap: "gap-1" },
  lg: { icon: "h-7 w-7", gap: "gap-1" },
} as const;

export function RatingStars({
  rating,
  size = "md",
  className,
}: {
  rating: number;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const value = Number.isFinite(rating) ? Math.max(0, Math.min(5, rating)) : 0;
  const config = sizes[size];

  return (
    <span
      className={cn("inline-flex items-center", config.gap, className)}
      role="img"
      aria-label={`${value.toFixed(1)} / ৫ স্টার`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.max(0, Math.min(1, value - (star - 1))) * 100;
        return (
          <span key={star} className={cn("relative inline-flex shrink-0", config.icon)} aria-hidden>
            <Star className={cn(config.icon, "fill-slate-200 text-slate-300 dark:fill-slate-700 dark:text-slate-600")} />
            <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill}%` }}>
              <Star className={cn(config.icon, "max-w-none fill-amber-400 text-amber-400")} />
            </span>
          </span>
        );
      })}
    </span>
  );
}
