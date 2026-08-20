"use client";

import { Children, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Scroll-scrubbed 3D fan. Children stay a real grid for layout/tap targets;
 * an outer wrapper rotates them from a stacked deck into an open brochure.
 */
export function ScrollFan({ children, className }: { children: ReactNode; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const count = Children.count(children);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-fan-item]"));
    const center = (items.length - 1) / 2;
    items.forEach((item, index) => {
      item.style.setProperty("--fan-from-center", (index - center).toFixed(3));
      item.style.setProperty("--fan-depth", (1 - Math.abs(index - center)).toFixed(3));
    });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 768px)");

    const applyStatic = () => {
      root.dataset.fanMotion = "static";
      root.style.setProperty("--fan-progress", "1");
    };

    let frame: number | null = null;
    const render = () => {
      frame = null;
      if (reduced.matches || !desktop.matches) {
        applyStatic();
        return;
      }
      root.dataset.fanMotion = "enabled";
      const rect = root.getBoundingClientRect();
      const view = Math.max(window.innerHeight, 1);
      const mid = rect.top + rect.height / 2;
      const progress = clamp(1 - Math.abs(mid - view * 0.52) / (view * 0.72), 0.18, 1);
      root.style.setProperty("--fan-progress", progress.toFixed(4));
    };

    const schedule = () => {
      if (frame === null) frame = window.requestAnimationFrame(render);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    reduced.addEventListener("change", schedule);
    desktop.addEventListener("change", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduced.removeEventListener("change", schedule);
      desktop.removeEventListener("change", schedule);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [count]);

  return (
    <div ref={rootRef} data-scroll-fan className={cn("scroll-fan", className)} style={{ "--fan-progress": 1 } as CSSProperties}>
      {Children.map(children, (child, index) => (
        <div key={index} data-fan-item className="scroll-fan-item">
          {child}
        </div>
      ))}
    </div>
  );
}
