import Link from "next/link";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { type TuitionPublic } from "@/types/index";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TuitionStatusBadge } from "@/components/shared/status-badge";
import { formatTaka, modeLabel } from "@/lib/utils";

export function TuitionCard({ tuition }: { tuition: TuitionPublic }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/tuitions/${tuition.id}`}
            className="text-base font-semibold text-slate-900 hover:text-brand-700"
          >
            {tuition.title}
          </Link>
          <TuitionStatusBadge status={tuition.status} />
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant="brand">{tuition.class_level}</Badge>
          <Badge variant="accent">{tuition.subject}</Badge>
          <Badge variant="outline">{modeLabel(tuition.teaching_mode)}</Badge>
        </div>

        <dl className="mt-4 space-y-1.5 text-sm text-slate-600">
          {tuition.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" aria-hidden />
              {tuition.location}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" aria-hidden />
            {tuition.preferred_time || "Flexible time"}
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden />
            {tuition.preferred_days?.length
              ? tuition.preferred_days.join(", ")
              : "Flexible days"}
          </div>
        </dl>

        {tuition.requirements && (
          <p className="mt-3 line-clamp-2 text-sm text-slate-500">
            {tuition.requirements}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-sm font-semibold text-slate-800">
            {formatTaka(tuition.budget)}
            {tuition.budget_negotiable && (
              <span className="ml-1 text-xs font-normal text-slate-400">
                (negotiable)
              </span>
            )}
          </span>
          <Link
            href={`/tuitions/${tuition.id}`}
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            View details →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
