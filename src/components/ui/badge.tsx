import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "brand" | "accent" | "success" | "warning" | "danger" | "info" | "outline";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100",
  brand: "bg-brand-100 text-brand-800 dark:bg-brand-950/70 dark:text-brand-200",
  accent: "bg-accent-500/10 text-accent-700 dark:bg-amber-950/50 dark:text-amber-300",
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200",
  danger: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200",
  info: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-200",
  outline: "border border-slate-300 bg-transparent text-slate-700 dark:border-slate-600 dark:text-slate-200",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
