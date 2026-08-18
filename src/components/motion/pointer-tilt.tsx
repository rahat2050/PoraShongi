"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useCanUsePointerMotion } from "@/components/motion/reduced-motion";

type PointerTiltProps = {
  children: ReactNode;
  className?: string;
  maxRotation?: number;
  maxLayerOffset?: number;
  scrollRange?: number;
  perspective?: number;
};

type TiltLayer = HTMLElement & {
  dataset: DOMStringMap & { pointerLayer?: string };
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * A zero-dependency, compositor-only 3D stage. Descendants carrying
 * `data-pointer-layer="0.5"` receive proportional depth without React renders.
 */
export function PointerTilt({
  children,
  className,
  maxRotation = 4,
  maxLayerOffset = 12,
  scrollRange = 12,
  perspective = 1100,
}: PointerTiltProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canAnimate = useCanUsePointerMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const layers = Array.from(root.querySelectorAll<TiltLayer>("[data-pointer-layer]"));
    let frame: number | null = null;
    let pointerX = 0;
    let pointerY = 0;
    let scrollY = 0;

    const clearMotion = () => {
      root.style.removeProperty("--pointer-rotate-x");
      root.style.removeProperty("--pointer-rotate-y");
      root.style.removeProperty("--pointer-scroll-y");
      root.removeAttribute("data-pointer-active");
      for (const layer of layers) {
        layer.style.removeProperty("--pointer-layer-x");
        layer.style.removeProperty("--pointer-layer-y");
        layer.style.removeProperty("--pointer-layer-z");
      }
    };

    if (!canAnimate) {
      root.dataset.pointerMotion = "static";
      clearMotion();
      return;
    }

    root.dataset.pointerMotion = "enabled";

    const render = () => {
      frame = null;
      root.style.setProperty("--pointer-rotate-x", `${(-pointerY * maxRotation).toFixed(3)}deg`);
      root.style.setProperty("--pointer-rotate-y", `${(pointerX * maxRotation).toFixed(3)}deg`);
      root.style.setProperty("--pointer-scroll-y", `${scrollY.toFixed(3)}px`);

      for (const layer of layers) {
        const depth = clamp(Number(layer.dataset.pointerLayer) || 0, -1, 1);
        layer.style.setProperty("--pointer-layer-x", `${(pointerX * maxLayerOffset * depth).toFixed(3)}px`);
        layer.style.setProperty("--pointer-layer-y", `${(pointerY * maxLayerOffset * depth + scrollY * depth * 0.2).toFixed(3)}px`);
        layer.style.setProperty("--pointer-layer-z", `${(depth * 34).toFixed(3)}px`);
      }
    };

    const scheduleRender = () => {
      if (frame === null) frame = window.requestAnimationFrame(render);
    };

    const updateScroll = () => {
      const rect = root.getBoundingClientRect();
      const viewportHeight = Math.max(window.innerHeight, 1);
      const centerOffset = viewportHeight / 2 - (rect.top + rect.height / 2);
      scrollY = clamp((centerOffset / viewportHeight) * scrollRange * 2, -scrollRange, scrollRange);
      scheduleRender();
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      pointerX = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      pointerY = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
      root.dataset.pointerActive = "true";
      scheduleRender();
    };

    const handlePointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
      root.removeAttribute("data-pointer-active");
      scheduleRender();
    };

    root.addEventListener("pointermove", handlePointerMove);
    root.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll, { passive: true });
    updateScroll();

    return () => {
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
      if (frame !== null) window.cancelAnimationFrame(frame);
      clearMotion();
      root.removeAttribute("data-pointer-motion");
    };
  }, [canAnimate, maxLayerOffset, maxRotation, scrollRange]);

  const style = { "--pointer-perspective": `${perspective}px` } as CSSProperties;

  return (
    <div ref={rootRef} className={cn("pointer-tilt", className)} style={style} data-pointer-tilt>
      {children}
    </div>
  );
}
