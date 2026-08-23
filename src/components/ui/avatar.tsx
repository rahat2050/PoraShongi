"use client";

import { useState } from "react";
import { cn, getInitials } from "@/lib/utils";

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
} as const;

const sizePx = { sm: 32, md: 40, lg: 64, xl: 96 } as const;

export function Avatar({
  src,
  name,
  alt,
  size = "md",
  className,
}: {
  src?: string | null;
  name?: string | null;
  alt?: string;
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src && failedSrc !== src);
  const dimension = sizePx[size];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 font-semibold text-brand-700",
        sizeClasses[size],
        className,
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src ?? undefined}
          alt={alt ?? name ?? ""}
          width={dimension}
          height={dimension}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          decoding="async"
          loading={size === "xl" ? "eager" : "lazy"}
          onError={() => setFailedSrc(src ?? null)}
        />
      ) : (
        <span aria-hidden>{getInitials(name)}</span>
      )}
    </span>
  );
}
