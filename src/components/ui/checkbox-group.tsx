"use client";

import { cn } from "@/lib/utils";

export function CheckboxGroup({
  options,
  selected,
  onChange,
  columns = 2,
  disabled,
}: {
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  columns?: 2 | 3 | 4;
  disabled?: boolean;
}) {
  const colClass =
    columns === 3
      ? "sm:grid-cols-3"
      : columns === 4
        ? "sm:grid-cols-4"
        : "sm:grid-cols-2";

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
              "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
              checked
                ? "border-brand-400 bg-brand-50 text-brand-800"
                : "border-slate-300 text-slate-700 hover:bg-slate-50",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            <input
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={() => toggle(option)}
              className="h-4 w-4 rounded border-slate-300 accent-brand-600"
            />
            {option}
          </label>
        );
      })}
    </div>
  );
}
