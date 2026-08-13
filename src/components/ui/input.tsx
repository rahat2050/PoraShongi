import { cn } from "@/lib/utils";

export function Input({
  className,
  invalid,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70",
        invalid
          ? "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-200"
          : "border-slate-300 focus-visible:border-brand-500 focus-visible:ring-brand-200",
        className,
      )}
      {...props}
    />
  );
}
