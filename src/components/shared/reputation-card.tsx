import { BadgeCheck, Star, ThumbsUp, TrendingDown } from "lucide-react";
import { type TeacherReputation } from "@/types/index";
import { Card, CardContent } from "@/components/ui/card";
import { VerificationTierBadge } from "@/components/shared/verification-tier";

/** Transparent teacher reputation indicators. */
export function ReputationCard({
  reputation,
  className,
}: {
  reputation: TeacherReputation;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Reputation</h3>
          <VerificationTierBadge tier={reputation.tier} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Metric
            icon={<Star className="h-4 w-4 text-amber-500" aria-hidden />}
            label="Rating"
            value={
              reputation.review_count > 0
                ? `${reputation.rating_avg} (${reputation.review_count})`
                : "New"
            }
          />
          <Metric
            icon={<BadgeCheck className="h-4 w-4 text-brand-600" aria-hidden />}
            label="Completed"
            value={`${reputation.completed_tuitions}`}
          />
          <Metric
            icon={<ThumbsUp className="h-4 w-4 text-emerald-600" aria-hidden />}
            label="Response"
            value={`${reputation.response_rate}%`}
          />
          <Metric
            icon={<TrendingDown className="h-4 w-4 text-red-500" aria-hidden />}
            label="Cancellation"
            value={`${reputation.cancellation_rate}%`}
          />
          <Metric
            icon={<BadgeCheck className="h-4 w-4 text-sky-600" aria-hidden />}
            label="Phone"
            value={reputation.phone_verified ? "Verified" : "—"}
          />
          <Metric
            icon={<BadgeCheck className="h-4 w-4 text-sky-600" aria-hidden />}
            label="Education"
            value={reputation.education_verified ? "Verified" : "—"}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {icon}
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
