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
    <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-5 dark:border-brand-800 dark:bg-brand-950/30">
      <h2 className="text-sm font-semibold text-brand-900 dark:text-brand-100">🚀 আপনার পরবর্তী ধাপ</h2>
      <ul className="mt-3 space-y-2">
        {steps.map((step) => (
          <li key={step.label} className="flex items-center gap-2.5">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                step.done ? "bg-brand-700 text-white" : "border border-slate-300 bg-white text-transparent dark:border-slate-600 dark:bg-slate-800"
              }`}
            >
              <Check className="h-3 w-3" aria-hidden />
            </span>
            {step.done ? (
              <span className="text-sm text-slate-500 line-through dark:text-slate-400">{step.label}</span>
            ) : (
              <Link href={step.href} className="text-sm font-medium text-brand-800 hover:underline dark:text-brand-300">
                {step.label} →
              </Link>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{pending.length}টি ধাপ বাকি</p>
    </div>
  );
}
