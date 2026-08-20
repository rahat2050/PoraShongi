"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Award, ChevronLeft, ChevronRight, Clock3, MapPin, Star } from "lucide-react";
import type { TeacherPublic } from "@/types/index";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function FeaturedCoverflow({
  teachers,
  title,
  description,
}: {
  teachers: TeacherPublic[];
  title: string;
  description: string;
}) {
  const [idx, setIdx] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derived safe index — avoids setState-in-effect lint and keeps idx valid when teachers length changes
  const safeIdx = teachers.length === 0 ? 0 : ((idx % teachers.length) + teachers.length) % teachers.length;

  const next = useCallback(() => {
    if (teachers.length === 0) return;
    setIdx((p) => (p + 1) % teachers.length);
  }, [teachers.length]);

  const prev = useCallback(() => {
    if (teachers.length === 0) return;
    setIdx((p) => (p - 1 + teachers.length) % teachers.length);
  }, [teachers.length]);

  // Auto-play, pause on drag
  useEffect(() => {
    if (teachers.length <= 1 || isDragging) return;
    const t = window.setInterval(next, 3800);
    return () => window.clearInterval(t);
  }, [isDragging, teachers.length, next]);

  // Keyboard
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragX(e.clientX - startX.current);
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) prev();
      else next();
    }
    setIsDragging(false);
    setDragX(0);
  };

  if (teachers.length === 0) return null;

  // Single teacher fallback
  if (teachers.length === 1) {
    const t = teachers[0];
    return (
      <section className="bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">শিক্ষক ডিসকভারি</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl dark:text-white">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{description}</p>
            </div>
            <Link href="/teachers" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-brand-800 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-600 dark:bg-slate-800 dark:text-brand-300">
              সব দেখুন <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mx-auto mt-10 max-w-md">
            <TeacherCard teacher={t} featured />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-white dark:bg-slate-900" aria-labelledby="featured-coverflow-title">
      <div className="motion-parallax-slow pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-brand-100/50 blur-3xl dark:bg-brand-900/10" aria-hidden />
      <div className="motion-parallax-fast pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-amber-100/40 blur-3xl dark:bg-amber-900/10" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">
              <Award className="h-4 w-4" /> শিক্ষক ডিসকভারি
            </p>
            <h2 id="featured-coverflow-title" className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl dark:text-white">
              {title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              aria-label="আগের শিক্ষক"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              aria-label="পরের শিক্ষক"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-700"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <Link href="/teachers" className="ml-2 hidden min-h-11 items-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-bold text-white hover:bg-brand-800 sm:inline-flex dark:bg-brand-600 dark:hover:bg-brand-700">
              সব দেখুন <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Coverflow stage */}
        <div
          ref={containerRef}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="ফিচার্ড শিক্ষক ক্যারোসেল"
          className="relative mt-10 select-none outline-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => {
            setIsDragging(false);
            setDragX(0);
          }}
          style={{ touchAction: "pan-y" }}
        >
          <div className="relative mx-auto flex h-[420px] max-w-6xl items-center justify-center sm:h-[440px]">
            <div className="relative h-full w-full" style={{ perspective: "1400px", transformStyle: "preserve-3d" as const }}>
              {teachers.map((teacher, i) => {
                let offset = i - safeIdx;
                const half = Math.floor(teachers.length / 2);
                if (offset > half) offset -= teachers.length;
                if (offset < -half) offset += teachers.length;

                const abs = Math.abs(offset);
                const isCenter = offset === 0;
                const isVisible = abs <= 2;
                const dragInfluence = isDragging ? dragX * 0.05 : 0;
                const translateX = offset * 300 + dragInfluence * 2;

                return (
                  <div
                    key={teacher.id}
                    className={cn(
                      "absolute left-1/2 top-1/2 w-[300px] sm:w-[340px]",
                      "transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform",
                      isVisible ? "visible" : "invisible",
                    )}
                    style={{
                      transform: `translateX(calc(-50% + ${translateX}px)) translateY(-50%) translateZ(${isCenter ? 90 : -70 - abs * 35}px) rotateY(${offset * -22 + dragInfluence * 0.1}deg) scale(${isCenter ? 1 : 0.88 - abs * 0.05})`,
                      opacity: isVisible ? (isCenter ? 1 : 0.72 - abs * 0.18) : 0,
                      zIndex: isCenter ? 30 : 20 - abs,
                      pointerEvents: isCenter ? "auto" : "none",
                    }}
                    aria-hidden={!isCenter}
                  >
                    <TeacherCard teacher={teacher} featured={isCenter} />
                  </div>
                );
              })}
            </div>
            <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur sm:hidden">
              Swipe করে দেখুন
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              {teachers.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`শিক্ষক ${i + 1} দেখুন`}
                  aria-current={i === safeIdx ? "true" : undefined}
                  className={cn(
                    "h-2.5 rounded-full transition-all",
                    i === safeIdx ? "w-8 bg-brand-700 dark:bg-brand-500" : "w-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400",
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                {String(safeIdx + 1).padStart(2, "0")} / {String(teachers.length).padStart(2, "0")}
              </span>
              <span className="hidden h-4 w-px bg-slate-200 dark:bg-slate-700 sm:block" aria-hidden />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Drag করুন বা arrow চাপুন • Auto-play</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center sm:hidden">
          <Link href="/teachers" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-700 px-5 text-sm font-bold text-white hover:bg-brand-800">
            সব শিক্ষক দেখুন <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function TeacherCard({ teacher, featured }: { teacher: TeacherPublic; featured?: boolean }) {
  const displayName = teacher.display_name || teacher.full_name || "শিক্ষক";
  const location = [teacher.area, teacher.district].filter(Boolean).join(", ");
  const subjects = (teacher.subjects ?? []).slice(0, 3);
  const hasRating = Boolean(teacher.review_count && teacher.review_count > 0 && teacher.rating_avg != null);

  return (
    <Link
      href={`/teachers/${teacher.id}`}
      className={cn(
        "group flex min-h-[380px] flex-col overflow-hidden rounded-[1.75rem] border bg-white shadow-xl transition-all hover:shadow-2xl dark:bg-slate-800",
        featured ? "border-brand-200 dark:border-brand-800 shadow-[0_20px_60px_-20px_rgba(15,118,110,.35)]" : "border-slate-200 dark:border-slate-700",
      )}
      aria-label={`${displayName}-এর প্রোফাইল দেখুন`}
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-brand-700 via-brand-500 to-amber-400 opacity-80 group-hover:opacity-100" aria-hidden />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-3">
          <Avatar src={teacher.avatar_url} name={displayName} size="lg" className="h-14 w-14 shrink-0 border-2 border-white shadow-md transition-transform duration-300 group-hover:scale-110 dark:border-slate-700" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="truncate text-[15px] font-black leading-tight text-slate-900 group-hover:text-brand-800 dark:text-white dark:group-hover:text-brand-300">
                {displayName}
              </h3>
              {teacher.verification_status === "verified" && (
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300" title="যাচাইকৃত">
                  <Award className="h-3 w-3" />
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-xs font-medium text-slate-600 dark:text-slate-300">{teacher.headline || teacher.education || "টিউশন শিক্ষক"}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {teacher.is_premium && <Badge variant="accent" className="text-[10px]">★ প্রিমিয়াম</Badge>}
              {teacher.verification_status === "verified" && <Badge variant="success" className="text-[10px]">যাচাইকৃত</Badge>}
            </div>
          </div>
        </div>

        {subjects.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {subjects.map((s) => (
              <Badge key={s} variant="brand" className="text-xs">
                {s}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-4 grid gap-2 rounded-2xl bg-slate-50 p-3 text-xs dark:bg-slate-900/60">
          <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
            {hasRating ? (
              <span>
                <span className="font-bold text-slate-900 dark:text-white">{teacher.rating_avg}</span> · {teacher.review_count} রিভিউ
              </span>
            ) : (
              <span className="text-slate-500">নতুন শিক্ষক</span>
            )}
          </span>
          <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Clock3 className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            {teacher.experience_years != null ? `${teacher.experience_years} বছরের অভিজ্ঞতা` : "অভিজ্ঞতা উল্লেখ নেই"}
          </span>
          <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            <span className="truncate">{location || "অনলাইন"}</span>
          </span>
        </div>

        <span className="mt-auto flex items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm font-bold text-brand-800 dark:border-slate-700 dark:text-brand-300">
          প্রোফাইল দেখুন
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition-transform group-hover:translate-x-0.5 group-hover:bg-brand-700 group-hover:text-white dark:bg-brand-900/40 dark:text-brand-300 dark:group-hover:bg-brand-600 dark:group-hover:text-white">
            <ArrowRight className="h-4 w-4" />
          </span>
        </span>
      </div>
    </Link>
  );
}
