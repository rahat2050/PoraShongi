import Link from "next/link";
import { ArrowRight, Clock3, MapPin, RotateCw, Star } from "lucide-react";
import type { TeacherPublic } from "@/types/index";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PointerTilt } from "@/components/motion/pointer-tilt";
import { PremiumTeacherFlip } from "@/components/shared/premium-teacher-flip";

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
    <section className={tone === "muted" ? "border-y border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950" : "bg-white dark:bg-slate-900"}>
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">শিক্ষক ডিসকভারি</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl dark:text-white">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{description}</p>
          </div>
          <Link href={viewAllHref} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-brand-800 transition-all hover:border-brand-300 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:border-slate-600 dark:bg-slate-800 dark:text-brand-300 dark:hover:border-brand-700 dark:hover:bg-brand-950/50">
            সব দেখুন <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.slice(0, 6).map((teacher) => {
            const name = teacher.display_name || teacher.full_name || "শিক্ষক";
            const card = (
              <Link
                href={`/teachers/${teacher.id}`}
                className="block h-full rounded-[1.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-4"
                aria-label={`${name}-এর প্রোফাইল দেখুন`}
              >
                <div className="group flex min-h-80 flex-col rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-36px_rgba(15,23,42,.5)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_26px_65px_-34px_rgba(15,118,110,.4)] dark:border-slate-700 dark:bg-slate-800 dark:group-hover:border-brand-700">
                  <div className="flex items-start gap-3">
                    <Avatar src={teacher.avatar_url} name={name} size="lg" className="transition-transform duration-300 group-hover:scale-110" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="truncate text-lg font-bold text-slate-900 transition-colors group-hover:text-brand-800 dark:text-slate-100 dark:group-hover:text-brand-300">{name}</h3>
                        {teacher.verification_status === "verified" && <Badge variant="success">যাচাইকৃত</Badge>}
                        {teacher.is_premium && (
                          <>
                            <Badge variant="accent">★ প্রিমিয়াম</Badge>
                            <span className="flip-hint inline-flex shrink-0 text-amber-600 dark:text-amber-400" title="আরও তথ্যের জন্য কার্ডটি উল্টান" aria-hidden>
                              <RotateCw className="h-3.5 w-3.5" />
                            </span>
                          </>
                        )}
                      </div>
                      <p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-300">{teacher.headline || teacher.education || "টিউশন শিক্ষক"}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex min-h-7 flex-wrap gap-1.5">
                    {(teacher.subjects ?? []).slice(0, 3).map((subject) => <Badge key={subject} variant="brand">{subject}</Badge>)}
                  </div>

                  <div className="mt-5 grid gap-2 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-900/70 dark:text-slate-300">
                    <span className="flex items-center gap-2">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                      {teacher.review_count ? `${teacher.rating_avg} · ${teacher.review_count} রিভিউ` : "নতুন শিক্ষক"}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock3 className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                      {teacher.experience_years != null ? `${teacher.experience_years} বছরের অভিজ্ঞতা` : "অভিজ্ঞতা উল্লেখ নেই"}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                      {[teacher.area, teacher.district].filter(Boolean).join(", ") || "অনলাইন"}
                    </span>
                  </div>

                  <span className="mt-auto inline-flex items-center justify-between gap-3 border-t border-slate-200 pt-5 text-sm font-bold text-brand-800 dark:border-slate-700 dark:text-brand-300">
                    প্রোফাইল দেখুন
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </div>
              </Link>
            );
            return (
              <div key={teacher.id} className="motion-flip">
                <PointerTilt maxRotation={3.5} maxLayerOffset={9} className="group h-full rounded-[1.5rem]">
                  {teacher.is_premium ? (
                    <PremiumTeacherFlip teacher={teacher} front={card} rounded="rounded-[1.5rem]" />
                  ) : (
                    card
                  )}
                </PointerTilt>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
