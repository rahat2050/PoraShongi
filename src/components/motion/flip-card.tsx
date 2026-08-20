"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useCanUsePointerMotion, usePrefersReducedMotion } from "@/components/motion/reduced-motion";

type FlipCardProps = {
  front: ReactNode;
  back: ReactNode;
  className?: string;
};

/**
 * Zero-dependency 3D flip card.
 * - Desktop (fine pointer): মাউস hover করলে উল্টে যায়।
 * - Touch devices: link/button ছাড়া যেকোনো জায়গায় ট্যাপ করলে উল্টে যায়।
 * - prefers-reduced-motion: সবসময় স্থির — সামনের দিকটাই দেখা যায়।
 *
 * Back side যখন দেখা যাচ্ছে না, তখন `inert` + `aria-hidden` থাকে, তাই গোপন
 * link গুলো tab/সহায়ক প্রযুক্তিতে আসে না।
 */
export function FlipCard({ front, back, className }: FlipCardProps) {
  const [hovered, setHovered] = useState(false);
  const [tapped, setTapped] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const canHover = useCanUsePointerMotion();

  // SSR/no-JS ও reduced-motion ব্যবহারকারীরা সবসময় সামনের দিক দেখেন।
  const flipped = reducedMotion ? false : canHover ? hovered : tapped;

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (canHover) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("a, button")) return;
    setTapped((value) => !value);
  };

  return (
    <div
      className={cn("flip-card group h-full", className)}
      data-flipped={flipped || undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      <div className="flip-inner h-full">
        <div className="flip-face flip-front">{front}</div>
        <div className="flip-face flip-back" aria-hidden={!flipped} inert={!flipped}>
          {back}
        </div>
      </div>
    </div>
  );
}
