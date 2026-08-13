import Link from "next/link";
import { Search } from "lucide-react";
import {
  CLASS_LEVELS,
  SUBJECTS,
  TEACHING_MODES,
  TIME_SLOTS,
  WEEK_DAYS,
} from "@/config/options";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { buttonStyles } from "@/components/ui/button";

export function TuitionFilters({
  current,
}: {
  current: {
    classLevel?: string;
    subject?: string;
    location?: string;
    minBudget?: string;
    maxBudget?: string;
    mode?: string;
    day?: string;
    time?: string;
  };
}) {
  return (
    <form method="get" action="/tuitions" className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
          placeholder="Location (e.g. Sunamganj)"
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

        <Select name="day" defaultValue={current.day ?? ""} aria-label="Preferred day">
          <option value="">Any day</option>
          {WEEK_DAYS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>

        <Select name="time" defaultValue={current.time ?? ""} aria-label="Preferred time">
          <option value="">Any time</option>
          {TIME_SLOTS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>

        <Input
          name="minBudget"
          type="number"
          min={0}
          placeholder="Min budget (৳)"
          defaultValue={current.minBudget ?? ""}
          aria-label="Minimum budget"
        />
        <Input
          name="maxBudget"
          type="number"
          min={0}
          placeholder="Max budget (৳)"
          defaultValue={current.maxBudget ?? ""}
          aria-label="Maximum budget"
        />
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <Link href="/tuitions" className={buttonStyles({ variant: "ghost", size: "sm" })}>
          Reset
        </Link>
        <button type="submit" className={buttonStyles({ size: "sm" })}>
          <Search className="h-4 w-4" aria-hidden />
          Search tuitions
        </button>
      </div>
    </form>
  );
}
