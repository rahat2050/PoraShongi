"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { CLASS_LEVELS, DISTANCE_RADIUS, DISTRICTS, SUBJECTS, TEACHING_MODES } from "@/config/options";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "relevance", label: "প্রাসঙ্গিক" },
  { value: "nearest", label: "সবচেয়ে কাছে" },
  { value: "rating", label: "সেরা রেটিং" },
  { value: "experience", label: "সবচেয়ে অভিজ্ঞ" },
  { value: "newest", label: "নতুন" },
];

type CurrentFilters = {
  classLevel?: string;
  subject?: string;
  district?: string;
  area?: string;
  mode?: string;
  gender?: string;
  experience?: string;
  minRating?: string;
  verified?: string;
  sort?: string;
  radius?: string;
};

export function TeacherFilters({
  current,
  canUseDistance,
}: {
  current: CurrentFilters;
  canUseDistance: boolean;
}) {
  const activeCount = [
    current.classLevel,
    current.subject,
    current.district,
    current.area,
    current.mode,
    current.gender,
    current.experience,
    current.minRating,
    current.verified,
    current.radius,
  ].filter(Boolean).length;
  const [mobileOpen, setMobileOpen] = useState(activeCount > 0);

  return (
    <form method="get" action="/teachers" className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <button
        type="button"
        onClick={() => setMobileOpen((value) => !value)}
        className="flex min-h-11 w-full items-center justify-between rounded-lg px-1 text-left font-medium text-slate-800 dark:text-slate-100 sm:hidden"
        aria-expanded={mobileOpen}
        aria-controls="teacher-filter-fields"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" aria-hidden />
          ফিল্টার ও সাজানো
          {activeCount > 0 && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-800">{activeCount}</span>}
        </span>
        <ChevronDown className={cn("h-5 w-5 transition-transform", mobileOpen && "rotate-180")} aria-hidden />
      </button>

      <div id="teacher-filter-fields" className={cn("mt-4 sm:mt-0", mobileOpen ? "block" : "hidden", "sm:block")}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FilterField label="ক্লাস" htmlFor="teacher-class">
            <Select id="teacher-class" name="class" defaultValue={current.classLevel ?? ""}>
              <option value="">সব ক্লাস</option>
              {CLASS_LEVELS.map((value) => <option key={value} value={value}>{value}</option>)}
            </Select>
          </FilterField>

          <FilterField label="বিষয়" htmlFor="teacher-subject">
            <Select id="teacher-subject" name="subject" defaultValue={current.subject ?? ""}>
              <option value="">সব বিষয়</option>
              {SUBJECTS.map((value) => <option key={value} value={value}>{value}</option>)}
            </Select>
          </FilterField>

          <FilterField label="জেলা" htmlFor="teacher-district">
            <Select id="teacher-district" name="district" defaultValue={current.district ?? ""}>
              <option value="">সব জেলা</option>
              {DISTRICTS.map((value) => <option key={value} value={value}>{value}</option>)}
            </Select>
          </FilterField>

          <FilterField label="এলাকা" htmlFor="teacher-area">
            <Input id="teacher-area" name="area" placeholder="থানা/উপজেলা" defaultValue={current.area ?? ""} />
          </FilterField>

          <FilterField label="দূরত্ব" htmlFor="teacher-radius">
            <Select
              id="teacher-radius"
              name="radius"
              defaultValue={canUseDistance ? (current.radius ?? "") : ""}
              disabled={!canUseDistance}
              title={!canUseDistance ? "দূরত্ব ব্যবহার করতে প্রোফাইলে লোকেশন যোগ করুন" : undefined}
            >
              {canUseDistance ? (
                DISTANCE_RADIUS.map((value) => <option key={value.value} value={value.value}>{value.label}</option>)
              ) : (
                <option value="">প্রোফাইলে লোকেশন যোগ করুন</option>
              )}
            </Select>
          </FilterField>

          <FilterField label="পড়ানোর মাধ্যম" htmlFor="teacher-mode">
            <Select id="teacher-mode" name="mode" defaultValue={current.mode ?? ""}>
              <option value="">যেকোনো মাধ্যম</option>
              {TEACHING_MODES.map((value) => <option key={value.value} value={value.value}>{value.label}</option>)}
            </Select>
          </FilterField>

          <FilterField label="লিঙ্গ" htmlFor="teacher-gender">
            <Select id="teacher-gender" name="gender" defaultValue={current.gender ?? ""}>
              <option value="">যেকোনো লিঙ্গ</option>
              <option value="male">পুরুষ</option>
              <option value="female">মহিলা</option>
            </Select>
          </FilterField>

          <FilterField label="অভিজ্ঞতা" htmlFor="teacher-experience">
            <Select id="teacher-experience" name="experience" defaultValue={current.experience ?? ""}>
              <option value="">যেকোনো অভিজ্ঞতা</option>
              <option value="1">১+ বছর</option>
              <option value="3">৩+ বছর</option>
              <option value="5">৫+ বছর</option>
              <option value="8">৮+ বছর</option>
            </Select>
          </FilterField>

          <FilterField label="রেটিং" htmlFor="teacher-rating">
            <Select id="teacher-rating" name="minRating" defaultValue={current.minRating ?? ""}>
              <option value="">যেকোনো রেটিং</option>
              <option value="3">৩+ স্টার</option>
              <option value="4">৪+ স্টার</option>
              <option value="4.5">৪.৫+ স্টার</option>
            </Select>
          </FilterField>
        </div>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input type="checkbox" name="verified" value="1" defaultChecked={current.verified === "1"} className="h-5 w-5 rounded border-slate-300 accent-brand-600" />
              শুধু যাচাইকৃত শিক্ষক
            </label>
            <FilterField label="সাজান" htmlFor="teacher-sort" compact>
              <Select id="teacher-sort" name="sort" defaultValue={current.sort ?? "relevance"} className="w-auto min-w-[10rem]">
                {SORT_OPTIONS.map((value) => (
                  <option key={value.value} value={value.value} disabled={value.value === "nearest" && !canUseDistance}>
                    {value.label}
                  </option>
                ))}
              </Select>
            </FilterField>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
            <Link href="/teachers" className={buttonStyles({ variant: "ghost" })}>মুছুন</Link>
            <button type="submit" className={buttonStyles()}>
              <Search className="h-4 w-4" aria-hidden />
              খুঁজুন
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function FilterField({
  label,
  htmlFor,
  compact = false,
  children,
}: {
  label: string;
  htmlFor: string;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={compact ? "w-auto" : undefined}>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">{label}</label>
      {children}
    </div>
  );
}
