import Link from "next/link";
import { CalendarDays, Clock, Lock, MapPin, Sparkles, Users } from "lucide-react";
import { type TuitionTeaser } from "@/types/index";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatTaka, modeLabel } from "@/lib/utils";

/** Hours since a timestamp, or null when unparseable. */
function hoursSince(iso: string): number | null {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return (Date.now() - then) / 36e5;
}

/**
 * Anonymous-safe tuition card.
 *
 * পোস্টদাতার নাম/ছবি ইচ্ছাকৃতভাবে নেই — RPC-ই সেগুলো পাঠায় না। "আবেদন করুন"
 * একটি soft gate: লগইন পাতায় পাঠায়, ফিরে আসার path সহ।
 */
export function TuitionTeaserCard({ tuition }: { tuition: TuitionTeaser }) {
  const location = [tuition.area, tuition.district].filter(Boolean).join(", ");
  const featured = Boolean(
    tuition.is_featured && (!tuition.featured_until || new Date(tuition.featured_until) > new Date()),
  );
  const age = hoursSince(tuition.created_at);
  const isNew = age !== null && age <= 48;

  return (
    <Card
      className={`group motion-card h-full transition-all hover:shadow-md ${
        featured
          ? "border-amber-300 bg-gradient-to-br from-amber-50 to-white shadow-md ring-1 ring-amber-200 dark:border-amber-700 dark:from-amber-950/30 dark:to-slate-800 dark:ring-amber-900"
          : ""
      }`}
    >
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          {isNew && <Badge variant="success">নতুন</Badge>}
          {featured && (
            <Badge variant="accent">
              <Sparkles className="h-3 w-3" aria-hidden /> Featured
            </Badge>
          )}
          {tuition.is_batch && (
            <Badge variant="info">
              <Users className="h-3 w-3" aria-hidden /> ব্যাচ
              {tuition.batch_size ? ` · ${tuition.seats_filled}/${tuition.batch_size}` : ""}
            </Badge>
          )}
        </div>

        <h3 className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">
          <Link href={`/tuitions/${tuition.id}`} className="hover:text-brand-700 dark:hover:text-brand-300">
            {tuition.title}
          </Link>
        </h3>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant="brand">{tuition.class_level}</Badge>
          <Badge variant="accent">{tuition.subject}</Badge>
          <Badge variant="outline">{modeLabel(tuition.teaching_mode)}</Badge>
        </div>

        <dl className="mt-4 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
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
            {tuition.budget_negotiable && (
              <span className="ml-1 text-xs font-normal text-slate-400">(আলোচনা সাপেক্ষ)</span>
            )}
          </span>
          <span className="text-xs text-slate-400">{formatDate(tuition.created_at)}</span>
        </div>

        <Link
          href={`/login?next=${encodeURIComponent(`/tuitions/${tuition.id}`)}`}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:border-brand-500 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-brand-300"
        >
          <Lock className="h-3.5 w-3.5" aria-hidden />
          আবেদন করতে লগইন করুন
        </Link>
      </CardContent>
    </Card>
  );
}
