import Link from "next/link";
import { Search } from "lucide-react";
import { CLASS_LEVELS, DISTRICTS, SUBJECTS, TEACHING_MODES, TIME_SLOTS, WEEK_DAYS } from "@/config/options";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { buttonStyles } from "@/components/ui/button";

export function TuitionFilters({
  current,
}: {
  current: {
    classLevel?: string;
    subject?: string;
    district?: string;
    area?: string;
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
        <Select name="class" defaultValue={current.classLevel ?? ""} aria-label="ক্লাস">
          <option value="">সব ক্লাস</option>
          {CLASS_LEVELS.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Select name="subject" defaultValue={current.subject ?? ""} aria-label="বিষয়">
          <option value="">সব বিষয়</option>
          {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select name="district" defaultValue={current.district ?? ""} aria-label="জেলা">
          <option value="">সব জেলা</option>
          {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </Select>
        <Input name="area" placeholder="এলাকা" defaultValue={current.area ?? ""} aria-label="এলাকা" />
        <Select name="mode" defaultValue={current.mode ?? ""} aria-label="মোড">
          <option value="">যেকোনো মোড</option>
          {TEACHING_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </Select>
        <Select name="day" defaultValue={current.day ?? ""} aria-label="দিন">
          <option value="">যেকোনো দিন</option>
          {WEEK_DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
        </Select>
        <Select name="time" defaultValue={current.time ?? ""} aria-label="সময়">
          <option value="">যেকোনো সময়</option>
          {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Input name="minBudget" type="number" min={0} placeholder="সর্বনিম্ন বাজেট (৳)" defaultValue={current.minBudget ?? ""} aria-label="সর্বনিম্ন বাজেট" />
        <Input name="maxBudget" type="number" min={0} placeholder="সর্বোচ্চ বাজেট (৳)" defaultValue={current.maxBudget ?? ""} aria-label="সর্বোচ্চ বাজেট" />
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <Link href="/tuitions" className={buttonStyles({ variant: "ghost", size: "sm" })}>মুছুন</Link>
        <button type="submit" className={buttonStyles({ size: "sm" })}>
          <Search className="h-4 w-4" aria-hidden />
          খুঁজুন
        </button>
      </div>
    </form>
  );
}
