import Link from "next/link";
import { BadgeCheck, BookOpen, MapPin } from "lucide-react";
import { type TeacherPublic } from "@/types/index";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { formatTaka, modeLabel } from "@/lib/utils";

export function TeacherCard({
  teacher,
  canSave = false,
  initiallySaved = false,
}: {
  teacher: TeacherPublic;
  canSave?: boolean;
  initiallySaved?: boolean;
}) {
  const name =
    teacher.display_name || teacher.full_name || "Teacher";

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Link href={`/teachers/${teacher.id}`} aria-label={`View ${name}`}>
            <Avatar src={teacher.avatar_url} name={name} size="lg" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/teachers/${teacher.id}`}
                className="truncate text-base font-semibold text-slate-900 hover:text-brand-700"
              >
                {name}
              </Link>
              {teacher.verification_status === "verified" && (
                <BadgeCheck
                  className="h-4 w-4 shrink-0 text-brand-600"
                  aria-label="Verified"
                />
              )}
            </div>
            <p className="truncate text-sm text-slate-500">
              {teacher.headline || teacher.education || "Tuition teacher"}
            </p>
            {teacher.location && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                <MapPin className="h-3 w-3" aria-hidden />
                {teacher.location}
              </p>
            )}
          </div>
          {canSave && (
            <FavoriteButton
              teacherId={teacher.id}
              initiallySaved={initiallySaved}
              className="shrink-0"
            />
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {teacher.subjects?.slice(0, 4).map((s) => (
            <Badge key={s} variant="brand">
              {s}
            </Badge>
          ))}
          {teacher.subjects && teacher.subjects.length > 4 && (
            <Badge variant="outline">+{teacher.subjects.length - 4} more</Badge>
          )}
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
          <InfoItem label="Classes" value={teacher.classes_taught?.slice(0, 3).join(", ") || "—"} />
          <InfoItem
            label="Experience"
            value={
              teacher.experience_years != null
                ? `${teacher.experience_years} yr${teacher.experience_years === 1 ? "" : "s"}`
                : "—"
            }
          />
          <InfoItem label="Mode" value={modeLabel(teacher.teaching_mode)} />
          <InfoItem label="Fee" value={formatTaka(teacher.expected_salary)} />
          <InfoItem
            label="Available"
            value={teacher.available_days?.slice(0, 3).join(", ") || "—"}
          />
          <InfoItem
            label="Phone"
            value={teacher.phone_verified ? "Verified" : "—"}
          />
        </dl>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <Link
            href={`/teachers/${teacher.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
          >
            <BookOpen className="h-4 w-4" aria-hidden />
            View full profile
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="truncate font-medium text-slate-700">{value}</dd>
    </div>
  );
}
