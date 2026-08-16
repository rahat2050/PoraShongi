import Link from "next/link";
import { Search } from "lucide-react";
import { CLASS_LEVELS, DISTANCE_RADIUS, DISTRICTS, SUBJECTS, TEACHING_MODES } from "@/config/options";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { buttonStyles } from "@/components/ui/button";

const SORT_OPTIONS = [
  { value: "relevance", label: "প্রাসঙ্গিক" },
  { value: "nearest", label: "সবচেয়ে কাছে" },
  { value: "rating", label: "সেরা রেটিং" },
  { value: "experience", label: "সবচেয়ে অভিজ্ঞ" },
  { value: "newest", label: "নতুন" },
];

export function TeacherFilters({
  current,
  canUseDistance,
}: {
  current: {
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
  canUseDistance: boolean;
}) {
  return (
    <form method="get" action="/teachers" className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

        <Input name="area" placeholder="এলাকা (থানা/উপজেলা)" defaultValue={current.area ?? ""} aria-label="এলাকা" />

        <Select
          name="radius"
          defaultValue={canUseDistance ? (current.radius ?? "") : ""}
          aria-label="দূরত্ব"
          disabled={!canUseDistance}
          title={!canUseDistance ? "দূরত্ব ব্যবহার করতে প্রোফাইলে লোকেশন যোগ করুন" : undefined}
        >
          {canUseDistance ? (
            DISTANCE_RADIUS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)
          ) : (
            <option value="">দূরত্বের জন্য লোকেশন যোগ করুন</option>
          )}
        </Select>

        <Select name="mode" defaultValue={current.mode ?? ""} aria-label="মোড">
          <option value="">যেকোনো মোড</option>
          {TEACHING_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </Select>

        <Select name="gender" defaultValue={current.gender ?? ""} aria-label="লিঙ্গ">
          <option value="">যেকোনো লিঙ্গ</option>
          <option value="male">পুরুষ</option>
          <option value="female">মহিলা</option>
        </Select>

        <Select name="experience" defaultValue={current.experience ?? ""} aria-label="অভিজ্ঞতা">
          <option value="">যেকোনো অভিজ্ঞতা</option>
          <option value="1">১+ বছর</option>
          <option value="3">৩+ বছর</option>
          <option value="5">৫+ বছর</option>
          <option value="8">৮+ বছর</option>
        </Select>

        <Select name="minRating" defaultValue={current.minRating ?? ""} aria-label="রেটিং">
          <option value="">যেকোনো রেটিং</option>
          <option value="4">৪+ স্টার</option>
          <option value="4.5">৪.৫+ স্টার</option>
        </Select>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="verified" value="1" defaultChecked={current.verified === "1"} className="h-4 w-4 rounded border-slate-300 accent-brand-600" />
            শুধু verified
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <span>সাজান:</span>
            <Select name="sort" defaultValue={current.sort ?? "relevance"} className="h-11 w-auto min-w-[9.5rem] text-sm">
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} disabled={o.value === "nearest" && !canUseDistance}>
                  {o.label}
                </option>
              ))}
            </Select>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/teachers" className={buttonStyles({ variant: "ghost", size: "sm" })}>মুছুন</Link>
          <button type="submit" className={buttonStyles({ size: "sm" })}>
            <Search className="h-4 w-4" aria-hidden />
            খুঁজুন
          </button>
        </div>
      </div>
    </form>
  );
}
