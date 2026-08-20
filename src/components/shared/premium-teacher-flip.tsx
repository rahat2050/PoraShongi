import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Crown,
  GraduationCap,
  MapPin,
  Star,
} from "lucide-react";
import type { TeacherPublic } from "@/types/index";
import { FlipCard } from "@/components/motion/flip-card";
import { cn } from "@/lib/utils";

/**
 * Premium শিক্ষকদের কার্ড — hover/tap করলে উল্টে যায় এবং শিক্ষক সম্পর্কে
 * অতিরিক্ত তথ্য + প্রিমিয়াম সুবিধা দেখায়। Front টা বাইরে থেকে পাঠানো হয়
 * যেন প্রতিটি জায়গার নিজস্ব কার্ড ডিজাইন ঠিক থাকে।
 */
export function PremiumTeacherFlip({
  teacher,
  front,
  rounded = "rounded-2xl",
}: {
  teacher: TeacherPublic;
  front: React.ReactNode;
  rounded?: string;
}) {
  return <FlipCard className="h-full" front={front} back={<PremiumBack teacher={teacher} rounded={rounded} />} />;
}

function PremiumBack({ teacher, rounded }: { teacher: TeacherPublic; rounded: string }) {
  const name = teacher.display_name || teacher.full_name || "শিক্ষক";
  const hasRating = Boolean(teacher.review_count && teacher.review_count > 0 && teacher.rating_avg != null);
  const location = [teacher.area, teacher.district].filter(Boolean).join(", ") || "অনলাইন";
  const days = teacher.available_days ?? [];
  const availability = [days.slice(0, 3).join(", "), teacher.available_time].filter(Boolean).join(" · ") || null;

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden overflow-y-auto border-2 border-amber-300/90 bg-[linear-gradient(150deg,#042f2e_0%,#0f3d3a_55%,#4a2c0d_145%)] p-4 text-white shadow-[0_22px_60px_-24px_rgba(4,47,46,.7)] dark:border-amber-400/80",
        rounded,
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-amber-400/15 blur-2xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-14 -left-10 h-32 w-32 rounded-full bg-brand-400/15 blur-2xl" aria-hidden />

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950">
          <Crown className="h-3 w-3" aria-hidden /> প্রিমিয়াম শিক্ষক
        </span>
        {teacher.verification_status === "verified" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-emerald-200">
            <BadgeCheck className="h-3 w-3" aria-hidden /> যাচাইকৃত
          </span>
        )}
      </div>

      <h3 className="mt-2 truncate text-lg font-black text-white">{name}</h3>
      {teacher.bio && <p className="mt-1 line-clamp-1 text-xs leading-5 text-brand-100/90">{teacher.bio}</p>}

      <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        <BackItem icon={<GraduationCap className="h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden />} label="শিক্ষা" value={teacher.education || "—"} />
        <BackItem
          icon={<Star className="h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden />}
          label="রেটিং"
          value={hasRating ? `★ ${teacher.rating_avg} (${teacher.review_count})` : "নতুন শিক্ষক"}
        />
        {availability && (
          <BackItem icon={<CalendarDays className="h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden />} label="উপলব্ধতা" value={availability} />
        )}
        <BackItem icon={<MapPin className="h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden />} label="এলাকা" value={location} />
      </dl>

      {(teacher.subjects ?? []).length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {(teacher.subjects ?? []).slice(0, 3).map((subject) => (
            <span key={subject} className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-amber-100">
              {subject}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-2.5">
        <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] leading-5 text-brand-50/90">
          <span className="font-bold text-amber-300">প্রিমিয়াম সুবিধা: </span>
          যাচাইকৃত তথ্য · অগ্রাধিকার ম্যাচ · দ্রুত সাড়া · উন্নত দৃশ্যমানতা
        </div>
        <Link
          href={`/teachers/${teacher.id}`}
          className="mt-2.5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 text-sm font-bold text-slate-950 shadow-lg shadow-amber-900/30 transition-transform hover:-translate-y-0.5 hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          aria-label={`${name}-এর সম্পূর্ণ প্রোফাইল দেখুন`}
        >
          সম্পূর্ণ প্রোফাইল দেখুন <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <p className="flip-back-hint mt-1.5 text-center text-[10px] text-brand-100/60">ফিরে যেতে আবার ট্যাপ করুন</p>
      </div>
    </div>
  );
}

function BackItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-brand-100/70">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 truncate font-semibold text-white">{value}</dd>
    </div>
  );
}
