import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Select({
  className,
  invalid,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-11 w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70",
          invalid
            ? "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-200"
            : "border-slate-300 focus-visible:border-brand-500 focus-visible:ring-brand-200",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
    </div>
  );
}
