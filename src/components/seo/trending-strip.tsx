import Link from "next/link";
import { GraduationCap, MapPin, Sparkles } from "lucide-react";
import { DISTRICT_LANDINGS, EXAM_LANDINGS, SUBJECT_LANDINGS } from "@/config/seo";

/** হোমে সবসময় দেখানো জেলা — বাকিগুলো `/locations` থেকে পাওয়া যায়। */
const PROMOTED_DISTRICTS = [
  "Sylhet",
  "Sunamganj",
  "Dhaka",
  "Chattogram",
  "Cumilla",
  "Rajshahi",
  "Khulna",
  "Mymensingh",
  "Bogura",
  "Rangpur",
  "Barishal",
  "Jashore",
] as const;

type TrendChip = { label: string; href: string; icon: "subject" | "exam" | "district" };

function buildChips(): TrendChip[] {
  const districts = new Map(DISTRICT_LANDINGS.map((item) => [item.name, item]));

  const examChips: TrendChip[] = EXAM_LANDINGS.map((exam) => ({
    label: `${exam.nameBn} শিক্ষক`,
    href: exam.path,
    icon: "exam",
  }));

  const districtChips: TrendChip[] = PROMOTED_DISTRICTS.flatMap((name) => {
    const district = districts.get(name);
    if (!district) return [];
    return [{ label: `${district.possessiveBn} শিক্ষক`, href: district.path, icon: "district" as const }];
  });

  const subjectChips: TrendChip[] = SUBJECT_LANDINGS.slice(0, 12).map((subject) => ({
    label: `${subject.name} শিক্ষক`,
    href: subject.path,
    icon: "subject" as const,
  }));

  return [...examChips, ...subjectChips, ...districtChips];
}

function ChipIcon({ icon }: { icon: TrendChip["icon"] }) {
  if (icon === "subject") return <Sparkles className="h-3.5 w-3.5 text-brand-600 dark:text-brand-300" aria-hidden />;
  if (icon === "exam") return <GraduationCap className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" aria-hidden />;
  return <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />;
}

/**
 * হোমপেজের ট্রেন্ডিং ল্যান্ডিং স্ট্রিপ — প্রতিটি চিপ একটি আসল ল্যান্ডিং পেজের লিংক,
 * তাই সার্চ ইঞ্জিন এগুলো ক্রল করে। ডুপ্লিকেট কপিটা শুধু marquee ইফেক্টের জন্য,
 * স্ক্রিন রিডার ও ট্যাব অর্ডার থেকে বাদ দেওয়া।
 */
export function TrendingStrip() {
  const chips = buildChips();
  if (chips.length === 0) return null;

  return (
    <section
      className="border-b border-slate-200 bg-white py-4 dark:border-slate-800 dark:bg-slate-950"
      aria-label="জনপ্রিয় শিক্ষক খোঁজার লিংক"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6">
        <span className="hidden shrink-0 text-xs font-bold uppercase tracking-[0.16em] text-slate-500 sm:inline dark:text-slate-400">
          ট্রেন্ডিং
        </span>
        <div className="motion-marquee min-w-0 flex-1">
          <div className="motion-marquee-track">
            {[false, true].map((isDuplicate) => (
              <div key={isDuplicate ? "copy" : "primary"} className="flex shrink-0 items-center gap-3" {...(isDuplicate ? { "aria-hidden": true } : {})}>
                {chips.map((chip) => (
                  <Link
                    key={`${isDuplicate ? "copy" : "primary"}-${chip.href}`}
                    href={chip.href}
                    tabIndex={isDuplicate ? -1 : undefined}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-brand-300 hover:text-brand-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <ChipIcon icon={chip.icon} />
                    {chip.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
