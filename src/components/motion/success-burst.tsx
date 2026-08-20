"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfettiBurst } from "@/components/motion/confetti-burst";

/**
 * Celebratory checkmark pop + confetti burst for a "submit succeeded" state
 * (e.g. signup → verify-email screen). Purely decorative; reduced-motion
 * users get a static check with no particles.
 */
export function SuccessBurst({
  className,
  iconClassName,
  particleCount = 26,
}: {
  className?: string;
  iconClassName?: string;
  particleCount?: number;
}) {
  return (
    <div className={cn("relative inline-flex", className)}>
      <ConfettiBurst active count={particleCount} radius={110} />
      <span
        className={cn(
          "check-pop relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
          iconClassName,
        )}
      >
        <CheckCircle2 className="h-9 w-9" aria-hidden />
      </span>
    </div>
  );
}
