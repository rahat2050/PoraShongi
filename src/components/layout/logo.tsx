import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label={`${siteConfig.brandName} — ${siteConfig.tagline}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
        <GraduationCap className="h-5 w-5" aria-hidden />
      </span>
      {withText && (
        <span className="flex flex-col leading-tight">
          <span className="text-base font-bold tracking-tight text-slate-900">{siteConfig.brandName}</span>
          <span className="text-[10px] font-medium text-brand-700">{siteConfig.branding}</span>
        </span>
      )}
    </Link>
  );
}
