import Link from "next/link";
import { Clock3, MapPin, Star } from "lucide-react";
import type { TeacherPublic } from "@/types/index";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function HomeTeacherSection({
  title,
  description,
  teachers,
  viewAllHref = "/teachers",
  tone = "default",
}: {
  title: string;
  description: string;
  teachers: TeacherPublic[];
  viewAllHref?: string;
  tone?: "default" | "muted";
}) {
  if (teachers.length === 0) return null;

  return (
    <section className={tone === "muted" ? "bg-slate-50 dark:bg-slate-950" : "bg-white dark:bg-slate-900"}>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>
          </div>
          <Link href={viewAllHref} className="inline-flex min-h-11 items-center text-sm font-medium text-brand-800 hover:underline dark:text-brand-300">সব দেখুন →</Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.slice(0, 6).map((teacher) => {
            const name = teacher.display_name || teacher.full_name || "শিক্ষক";
            return (
              <Link
                key={teacher.id}
                href={`/teachers/${teacher.id}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:hover:border-brand-600"
                aria-label={`${name}-এর প্রোফাইল দেখুন`}
              >
                <div className="flex items-start gap-3">
                  <Avatar src={teacher.avatar_url} name={name} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="truncate font-semibold text-slate-900 group-hover:text-brand-800 dark:text-slate-100 dark:group-hover:text-brand-300">{name}</h3>
                      {teacher.verification_status === "verified" && <Badge variant="success">যাচাইকৃত</Badge>}
                      {teacher.is_premium && <Badge variant="accent">★ প্রিমিয়াম</Badge>}
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-300">{teacher.headline || teacher.education || "টিউশন শিক্ষক"}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(teacher.subjects ?? []).slice(0, 3).map((subject) => <Badge key={subject} variant="brand">{subject}</Badge>)}
                </div>

                <div className="mt-4 grid gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                    {teacher.review_count ? `${teacher.rating_avg} · ${teacher.review_count} রিভিউ` : "নতুন শিক্ষক"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                    {teacher.experience_years != null ? `${teacher.experience_years} বছরের অভিজ্ঞতা` : "অভিজ্ঞতা উল্লেখ নেই"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                    {[teacher.area, teacher.district].filter(Boolean).join(", ") || "অনলাইন"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
