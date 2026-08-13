import Link from "next/link";
import { Search } from "lucide-react";
import { CLASS_LEVELS, SUBJECTS, TEACHING_MODES, WEEK_DAYS } from "@/config/options";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { buttonStyles } from "@/components/ui/button";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "rating", label: "Highest rated" },
  { value: "experience", label: "Most experienced" },
  { value: "newest", label: "Newest" },
];

export function TeacherFilters({
  current,
}: {
  current: {
    classLevel?: string;
    subject?: string;
    location?: string;
    experience?: string;
    mode?: string;
    verified?: string;
    sort?: string;
    gender?: string;
    minRating?: string;
    day?: string;
    maxSalary?: string;
  };
}) {
  return (
    <form method="get" action="/teachers" className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select name="class" defaultValue={current.classLevel ?? ""} aria-label="Class">
          <option value="">All classes</option>
          {CLASS_LEVELS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>

        <Select name="subject" defaultValue={current.subject ?? ""} aria-label="Subject">
          <option value="">All subjects</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>

        <Input
          name="location"
          placeholder="Location (e.g. Sylhet)"
          defaultValue={current.location ?? ""}
          aria-label="Location"
        />

        <Select name="mode" defaultValue={current.mode ?? ""} aria-label="Teaching mode">
          <option value="">Any mode</option>
          {TEACHING_MODES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </Select>

        <Select name="gender" defaultValue={current.gender ?? ""} aria-label="Gender preference">
          <option value="">Any gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </Select>

        <Select name="experience" defaultValue={current.experience ?? ""} aria-label="Minimum experience">
          <option value="">Any experience</option>
          <option value="1">1+ years</option>
          <option value="3">3+ years</option>
          <option value="5">5+ years</option>
          <option value="8">8+ years</option>
          <option value="10">10+ years</option>
        </Select>

        <Select name="minRating" defaultValue={current.minRating ?? ""} aria-label="Minimum rating">
          <option value="">Any rating</option>
          <option value="4">4+ stars</option>
          <option value="4.5">4.5+ stars</option>
        </Select>

        <Select name="day" defaultValue={current.day ?? ""} aria-label="Available on">
          <option value="">Any day</option>
          {WEEK_DAYS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>

        <Input
          name="maxSalary"
          type="number"
          min={0}
          placeholder="Max fee (৳/month)"
          defaultValue={current.maxSalary ?? ""}
          aria-label="Maximum expected salary"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="verified"
              value="1"
              defaultChecked={current.verified === "1"}
              className="h-4 w-4 rounded border-slate-300 accent-brand-600"
            />
            Verified only
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <span>Sort:</span>
            <Select name="sort" defaultValue={current.sort ?? "relevance"} className="h-9 w-auto min-w-[9rem] text-sm">
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/teachers" className={buttonStyles({ variant: "ghost", size: "sm" })}>
            Reset
          </Link>
          <button type="submit" className={buttonStyles({ size: "sm" })}>
            <Search className="h-4 w-4" aria-hidden />
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
