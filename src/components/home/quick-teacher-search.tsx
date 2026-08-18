import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { CLASS_LEVELS, DISTRICTS, SUBJECTS, TEACHING_MODES } from "@/config/options";
import { Select } from "@/components/ui/select";
import { buttonStyles } from "@/components/ui/button";

export function QuickTeacherSearch() {
  return (
    <form
      action="/teachers"
      method="get"
      className="motion-reveal mx-auto mt-12 max-w-6xl rounded-[1.75rem] border border-white/80 bg-white/90 p-2.5 text-left shadow-[0_28px_80px_-38px_rgba(4,47,46,.55)] backdrop-blur-xl sm:p-3 dark:border-slate-700/80 dark:bg-slate-900/90"
      aria-label="দ্রুত শিক্ষক খুঁজুন"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-3 pt-1 sm:px-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">দ্রুত শিক্ষক খুঁজুন</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">আপনার প্রয়োজনের ৪টি তথ্য দিন</p>
          </div>
        </div>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-800 dark:bg-brand-950 dark:text-brand-200">লগইন লাগবে না</span>
      </div>

      <div className="grid gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/90 p-3 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] dark:border-slate-700 dark:bg-slate-950/70">
        <Filter label="ক্লাস" htmlFor="quick-class">
          <Select id="quick-class" name="class" defaultValue="" className="rounded-xl border-slate-200 bg-white shadow-sm dark:border-slate-700">
            <option value="">সব ক্লাস</option>
            {CLASS_LEVELS.map((value) => <option key={value} value={value}>{value}</option>)}
          </Select>
        </Filter>
        <Filter label="বিষয়" htmlFor="quick-subject">
          <Select id="quick-subject" name="subject" defaultValue="" className="rounded-xl border-slate-200 bg-white shadow-sm dark:border-slate-700">
            <option value="">সব বিষয়</option>
            {SUBJECTS.map((value) => <option key={value} value={value}>{value}</option>)}
          </Select>
        </Filter>
        <Filter label="জেলা" htmlFor="quick-district">
          <Select id="quick-district" name="district" defaultValue="" className="rounded-xl border-slate-200 bg-white shadow-sm dark:border-slate-700">
            <option value="">সব জেলা</option>
            {DISTRICTS.map((value) => <option key={value} value={value}>{value}</option>)}
          </Select>
        </Filter>
        <Filter label="মাধ্যম" htmlFor="quick-mode">
          <Select id="quick-mode" name="mode" defaultValue="" className="rounded-xl border-slate-200 bg-white shadow-sm dark:border-slate-700">
            <option value="">যেকোনো মাধ্যম</option>
            {TEACHING_MODES.map((value) => <option key={value.value} value={value.value}>{value.label}</option>)}
          </Select>
        </Filter>
        <button type="submit" className={buttonStyles({ className: "mt-1 h-11 rounded-xl px-6 sm:col-span-2 lg:col-span-1 lg:mt-5" })}>
          <Search className="h-4 w-4" aria-hidden /> খুঁজুন <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </form>
  );
}

function Filter({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">{label}</label>
      {children}
    </div>
  );
}
