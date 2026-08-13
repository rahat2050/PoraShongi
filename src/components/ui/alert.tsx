import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertVariant = "info" | "success" | "warning" | "danger";

const config: Record<
  AlertVariant,
  { icon: typeof Info; container: string; iconColor: string }
> = {
  info: {
    icon: Info,
    container: "border-sky-200 bg-sky-50 text-sky-800",
    iconColor: "text-sky-500",
  },
  success: {
    icon: CheckCircle2,
    container: "border-emerald-200 bg-emerald-50 text-emerald-800",
    iconColor: "text-emerald-500",
  },
  warning: {
    icon: AlertTriangle,
    container: "border-amber-200 bg-amber-50 text-amber-800",
    iconColor: "text-amber-500",
  },
  danger: {
    icon: AlertCircle,
    container: "border-red-200 bg-red-50 text-red-800",
    iconColor: "text-red-500",
  },
};

export function Alert({
  variant = "info",
  title,
  children,
  className,
}: {
  variant?: AlertVariant;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const { icon: Icon, container, iconColor } = config[variant];
  return (
    <div
      role={variant === "danger" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-xl border p-4 text-sm",
        container,
        className,
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconColor)} aria-hidden />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="mt-0.5 opacity-90">{children}</div>}
      </div>
    </div>
  );
}
