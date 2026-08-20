import Link from "next/link";
import { BadgeCheck, BookOpen, MapPin, RotateCw } from "lucide-react";
import { type TeacherPublic } from "@/types/index";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { PremiumTeacherFlip } from "@/components/shared/premium-teacher-flip";
import { formatDistance, formatTaka, modeLabel } from "@/lib/utils";

export function TeacherCard({
  teacher,
  canSave = false,
  initiallySaved = false,
}: {
  teacher: TeacherPublic;
  canSave?: boolean;
  initiallySaved?: boolean;
}) {
  const name = teacher.display_name || teacher.full_name || "শিক্ষক";
  const distance = formatDistance(teacher.distance_km);
  const profileLocation = [teacher.area, teacher.district].filter(Boolean).join(", ");
  const location = distance ?? (
    profileLocation || (teacher.teaching_mode === "online" || teacher.teaching_mode === "both" ? "অনলাইন" : "")
  );

  const card = (
    <Card className="group motion-card h-full transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Link href={`/teachers/${teacher.id}`} aria-label={`${name} দেখুন`}>
            <Avatar src={teacher.avatar_url} name={name} size="lg" className="transition-transform duration-300 group-hover:scale-110" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link href={`/teachers/${teacher.id}`} className="truncate text-base font-semibold text-slate-900 hover:text-brand-700">
                {name}
              </Link>
              {teacher.verification_status === "verified" && (
                <BadgeCheck className="h-4 w-4 shrink-0 text-brand-600" aria-label="Verified" />
              )}
              {teacher.is_premium && (
                <>
                  <Badge variant="accent">★ Premium</Badge>
                  <span className="flip-hint inline-flex shrink-0 text-amber-600 dark:text-amber-400" title="আরও তথ্যের জন্য কার্ডটি উল্টান" aria-hidden>
                    <RotateCw className="h-3.5 w-3.5" />
                  </span>
                </>
              )}
            </div>
            <p className="truncate text-sm text-slate-500">{teacher.headline || teacher.education || "টিউশন শিক্ষক"}</p>
            {location && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                <MapPin className="h-3 w-3" aria-hidden />
                {distance ? <span className="font-medium text-brand-700">{distance}</span> : location}
              </p>
            )}
          </div>
          {canSave && <FavoriteButton teacherId={teacher.id} initiallySaved={initiallySaved} />}
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {teacher.subjects?.slice(0, 4).map((s) => (
            <Badge key={s} variant="brand">{s}</Badge>
          ))}
          {teacher.subjects && teacher.subjects.length > 4 && (
            <Badge variant="outline">+{teacher.subjects.length - 4} আরও</Badge>
          )}
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
          <InfoItem label="ক্লাস" value={teacher.classes_taught?.slice(0, 3).join(", ") || "—"} />
          <InfoItem label="অভিজ্ঞতা" value={teacher.experience_years != null ? `${teacher.experience_years} বছর` : "—"} />
          <InfoItem label="মোড" value={modeLabel(teacher.teaching_mode)} />
          <InfoItem label="ফি" value={formatTaka(teacher.expected_salary)} />
          <InfoItem label="রেটিং" value={teacher.review_count ? `★ ${teacher.rating_avg}` : "নতুন"} />
        </dl>

        {(teacher.experience_years != null && teacher.experience_years >= 5) ||
        (teacher.rating_avg != null && teacher.rating_avg >= 4.5) ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {teacher.experience_years != null && teacher.experience_years >= 5 && (
              <Badge variant="info">অভিজ্ঞ</Badge>
            )}
            {teacher.rating_avg != null && teacher.rating_avg >= 4.5 && teacher.review_count != null && teacher.review_count > 0 && (
              <Badge variant="accent">Top Rated</Badge>
            )}
          </div>
        ) : null}

        <div className="mt-4 border-t border-slate-100 pt-4">
          <Link href={`/teachers/${teacher.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline">
            <BookOpen className="h-4 w-4" aria-hidden />
            সম্পূর্ণ প্রোফাইল দেখুন
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  return teacher.is_premium ? <PremiumTeacherFlip teacher={teacher} front={card} /> : card;
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="truncate font-medium text-slate-700">{value}</dd>
    </div>
  );
}
