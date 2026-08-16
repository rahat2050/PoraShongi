import Link from "next/link";
import { Check } from "lucide-react";

export type OnboardingStep = {
  label: string;
  done: boolean;
  href: string;
};

/** নতুন user-এর জন্য ধাপে ধাপে "এরপর কী করবেন" checklist। */
export function OnboardingChecklist({ steps }: { steps: OnboardingStep[] }) {
  const allDone = steps.every((s) => s.done);
  if (allDone) return null;

  const pending = steps.filter((s) => !s.done);

  return (
    <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-5">
      <h3 className="text-sm font-semibold text-brand-900">🚀 আপনার পরবর্তী ধাপ</h3>
      <ul className="mt-3 space-y-2">
        {steps.map((step) => (
          <li key={step.label} className="flex items-center gap-2.5">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                step.done ? "bg-brand-600 text-white" : "border border-slate-300 bg-white text-transparent"
              }`}
            >
              <Check className="h-3 w-3" aria-hidden />
            </span>
            {step.done ? (
              <span className="text-sm text-slate-500 line-through">{step.label}</span>
            ) : (
              <Link href={step.href} className="text-sm font-medium text-brand-700 hover:underline">
                {step.label} →
              </Link>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-slate-400">{pending.length} টা ধাপ বাকি</p>
    </div>
  );
}
