import Link from "next/link";
import { Search } from "lucide-react";
import { CLASS_LEVELS, SUBJECTS, TEACHING_MODES } from "@/config/options";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { buttonStyles } from "@/components/ui/button";

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
  };
}) {
  return (
    <form method="get" action="/teachers" className="rounded-2xl border border-slate-200 bg-white p-4">
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

        <Select name="experience" defaultValue={current.experience ?? ""} aria-label="Minimum experience">
          <option value="">Any experience</option>
          <option value="1">1+ years</option>
          <option value="3">3+ years</option>
          <option value="5">5+ years</option>
          <option value="8">8+ years</option>
          <option value="10">10+ years</option>
        </Select>

        <label className="flex h-11 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm text-slate-700">
          <input
            type="checkbox"
            name="verified"
            value="1"
            defaultChecked={current.verified === "1"}
            className="h-4 w-4 rounded border-slate-300 accent-brand-600"
          />
          Verified teachers only
        </label>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <Link href="/teachers" className={buttonStyles({ variant: "ghost", size: "sm" })}>
          Reset
        </Link>
        <button type="submit" className={buttonStyles({ size: "sm" })}>
          <Search className="h-4 w-4" aria-hidden />
          Search teachers
        </button>
      </div>
    </form>
  );
}
