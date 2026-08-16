import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * PoraSathi logo — custom gradient mark + brand text.
 * favicon (src/app/icon.svg + public/*.png) একই design ব্যবহার করে।
 */
export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("group flex min-h-11 items-center gap-2.5", className)}
      aria-label={withText ? undefined : `${siteConfig.brandName} — ${siteConfig.tagline}`}
    >
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-brand-700 to-brand-900 text-white shadow-sm transition-transform group-hover:scale-105">
        <GraduationCap className="h-5 w-5 text-accent-400" aria-hidden />
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-accent-400 dark:border-slate-900" />
      </span>
      {withText && (
        <span className="flex flex-col leading-tight">
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {siteConfig.brandName}
          </span>
          <span className="text-[10px] font-medium text-brand-700 dark:text-brand-300">
            {siteConfig.branding}
          </span>
        </span>
      )}
    </Link>
  );
}
