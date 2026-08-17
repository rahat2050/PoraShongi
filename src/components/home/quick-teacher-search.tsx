import { Search } from "lucide-react";
import { CLASS_LEVELS, DISTRICTS, SUBJECTS, TEACHING_MODES } from "@/config/options";
import { Select } from "@/components/ui/select";
import { buttonStyles } from "@/components/ui/button";

export function QuickTeacherSearch() {
  return (
    <form
      action="/teachers"
      method="get"
      className="mx-auto mt-10 max-w-5xl rounded-2xl border border-slate-200 bg-white/90 p-4 text-left shadow-lg shadow-slate-900/5 backdrop-blur dark:border-slate-700 dark:bg-slate-800/90"
      aria-label="দ্রুত শিক্ষক খুঁজুন"
    >
      <div className="mb-3 flex items-center gap-2">
        <Search className="h-5 w-5 text-brand-700 dark:text-brand-300" aria-hidden />
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">দ্রুত শিক্ষক খুঁজুন</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Filter label="ক্লাস" htmlFor="quick-class">
          <Select id="quick-class" name="class" defaultValue="">
            <option value="">সব ক্লাস</option>
            {CLASS_LEVELS.map((value) => <option key={value} value={value}>{value}</option>)}
          </Select>
        </Filter>
        <Filter label="বিষয়" htmlFor="quick-subject">
          <Select id="quick-subject" name="subject" defaultValue="">
            <option value="">সব বিষয়</option>
            {SUBJECTS.map((value) => <option key={value} value={value}>{value}</option>)}
          </Select>
        </Filter>
        <Filter label="জেলা" htmlFor="quick-district">
          <Select id="quick-district" name="district" defaultValue="">
            <option value="">সব জেলা</option>
            {DISTRICTS.map((value) => <option key={value} value={value}>{value}</option>)}
          </Select>
        </Filter>
        <Filter label="মাধ্যম" htmlFor="quick-mode">
          <Select id="quick-mode" name="mode" defaultValue="">
            <option value="">যেকোনো মাধ্যম</option>
            {TEACHING_MODES.map((value) => <option key={value.value} value={value.value}>{value.label}</option>)}
          </Select>
        </Filter>
        <button type="submit" className={buttonStyles({ className: "self-end" })}>
          <Search className="h-4 w-4" aria-hidden /> খুঁজুন
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
