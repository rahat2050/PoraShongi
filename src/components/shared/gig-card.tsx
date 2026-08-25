import Link from "next/link";
import { BadgeCheck, Clock, MapPin, Monitor, Sparkles, Wallet } from "lucide-react";
import type { TutorGigPublic } from "@/types/index";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatTaka, modeLabel } from "@/lib/utils";

/** শিক্ষকের তৈরি প্যাকেজ কার্ড — পাবলিক তালিকা ও বিস্তারিত পাতায় ব্যবহৃত। */
export function GigCard({ gig }: { gig: TutorGigPublic }) {
  const teacherName = gig.teacher_display_name || gig.teacher_full_name || "শিক্ষক";
  const totalSessions = gig.duration_weeks * gig.sessions_per_week;
  const place = [gig.teacher_area, gig.teacher_district].filter(Boolean).join(", ");

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-3 p-5">
        <div className="flex items-start gap-3">
          <Avatar src={gig.teacher_avatar} name={teacherName} size="sm" />
          <div className="min-w-0 flex-1">
            <Link
              href={`/gigs/${gig.id}`}
              className="line-clamp-2 text-base font-bold text-slate-900 hover:text-brand-700 dark:text-slate-100 dark:hover:text-brand-300"
            >
              {gig.title}
            </Link>
            <p className="mt-0.5 truncate text-sm text-slate-600 dark:text-slate-300">{teacherName}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {gig.teacher_verification_status === "verified" ? (
            <Badge variant="success">
              <BadgeCheck className="h-3 w-3" aria-hidden /> যাচাইকৃত
            </Badge>
          ) : null}
          {gig.includes_trial ? <Badge variant="accent">ফ্রি ট্রায়াল</Badge> : null}
          {gig.teacher_institution ? (
            <Badge variant="outline" className="max-w-full truncate">
              {gig.teacher_institution}
            </Badge>
          ) : null}
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{gig.description}</p>

        <ul className="mt-auto grid gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          <li className="flex items-center gap-2">
            <Wallet className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden />
            <span className="font-bold text-slate-900 dark:text-slate-100">{formatTaka(gig.price)}</span>
            <span className="text-slate-500 dark:text-slate-400">/ সম্পূর্ণ প্যাকেজ</span>
          </li>
          <li className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden />
            {gig.duration_weeks} সপ্তাহ · সপ্তাহে {gig.sessions_per_week} ক্লাস
            <span className="text-slate-500 dark:text-slate-400">({totalSessions} ক্লাস)</span>
          </li>
          <li className="flex items-center gap-2">
            <Monitor className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden />
            {modeLabel(gig.teaching_mode)}
          </li>
          {place ? (
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden />
              {place}
            </li>
          ) : null}
        </ul>

        <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
          {gig.subjects.slice(0, 5).map((subject) => (
            <span
              key={subject}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <Sparkles className="h-3 w-3 text-brand-600 dark:text-brand-300" aria-hidden />
              {subject}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
