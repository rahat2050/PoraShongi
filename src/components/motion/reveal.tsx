"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Extra delay in ms — pass `index * 70` for a stagger effect. */
  delay?: number;
  /** Direction the element slides in from. */
  direction?: "up" | "down" | "left" | "right" | "none";
};

/**
 * Lightweight scroll-reveal wrapper. Content is fully visible during SSR and
 * for no-JS/reduced-motion users; interactive users get a staggered entrance
 * as items cross into the viewport. No external library.
 */
export function Reveal({ children, className, delay = 0, direction = "up" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Hide only after mount so SSR/no-JS output stays visible. Deferred to a
    // frame so the initial paint is never a flash of hidden content.
    const frame = window.requestAnimationFrame(() => setHidden(true));

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHidden(false);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" },
    );
    observer.observe(el);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  const style = {
    ...(hidden && delay > 0 ? { transitionDelay: `${delay}ms` } : null),
  } as CSSProperties;

  return (
    <div
      ref={ref}
      data-reveal-hidden={hidden || undefined}
      data-reveal-dir={direction === "none" ? undefined : direction}
      className={cn("reveal-item", className)}
      style={style}
    >
      {children}
    </div>
  );
}
