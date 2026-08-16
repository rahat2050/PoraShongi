import Link from "next/link";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { type TuitionPublic } from "@/types/index";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { TuitionStatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatTaka, modeLabel } from "@/lib/utils";

export function TuitionCard({ tuition }: { tuition: TuitionPublic }) {
  const location = [tuition.area, tuition.district].filter(Boolean).join(", ");

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <Link href={`/tuitions/${tuition.id}`} className="text-base font-semibold text-slate-900 hover:text-brand-700">
                {tuition.title}
              </Link>
              {tuition.is_featured && <Badge variant="accent">Featured</Badge>}
            </div>
          </div>
          <TuitionStatusBadge status={tuition.status} />
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant="brand">{tuition.class_level}</Badge>
          <Badge variant="accent">{tuition.subject}</Badge>
          <Badge variant="outline">{modeLabel(tuition.teaching_mode)}</Badge>
        </div>

        <dl className="mt-4 space-y-1.5 text-sm text-slate-600">
          {location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" aria-hidden />
              {location}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" aria-hidden />
            {tuition.preferred_time || "যেকোনো সময়"}
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden />
            {tuition.preferred_days?.length ? tuition.preferred_days.join(", ") : "যেকোনো দিন"}
          </div>
        </dl>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {formatTaka(tuition.budget)}
            {tuition.budget_negotiable && <span className="ml-1 text-xs font-normal text-slate-400">(আলোচনা সাপেক্ষ)</span>}
          </span>
          <Link href={`/tuitions/${tuition.id}`} className="text-sm font-medium text-brand-700 hover:underline">
            বিস্তারিত →
          </Link>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <Avatar src={tuition.poster_avatar} name={tuition.poster_display_name ?? tuition.poster_name ?? undefined} size="sm" />
          <span className="truncate">
            {tuition.poster_display_name || tuition.poster_name || "সদস্য"} · {formatDate(tuition.created_at)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
