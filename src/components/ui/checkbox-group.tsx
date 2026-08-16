"use client";

import { cn } from "@/lib/utils";

export function CheckboxGroup({
  options,
  selected,
  onChange,
  columns = 3,
}: {
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  columns?: 2 | 3 | 4;
}) {
  const colClass =
    columns === 2 ? "sm:grid-cols-2" : columns === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3";

  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  return (
    <div className={cn("grid grid-cols-1 gap-1.5", colClass)}>
      {options.map((option) => {
        const checked = selected.includes(option);
        return (
          <label
            key={option}
            className={cn(
              "flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
              checked
                ? "border-brand-400 bg-brand-50 text-brand-800 dark:border-brand-600 dark:bg-brand-950/40 dark:text-brand-200"
                : "border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800",
            )}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(option)}
              className="h-5 w-5 rounded border-slate-300 accent-brand-700"
            />
            {option}
          </label>
        );
      })}
    </div>
  );
}
