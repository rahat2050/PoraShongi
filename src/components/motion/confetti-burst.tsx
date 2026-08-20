"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const COLORS = ["#10b981", "#f59e0b", "#0ea5e9", "#8b5cf6", "#f43f5e", "#22c55e", "#fbbf24"];

type Particle = {
  id: number;
  dx: number;
  dy: number;
  rotate: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
};

/**
 * Lightweight, zero-dependency confetti burst that plays once when `active`
 * flips to true. Particles are absolutely positioned around the centre of the
 * parent (parent must be `relative`). Reduced-motion users get nothing — a
 * screen-reader/polite experience stays silent.
 */
export function ConfettiBurst({
  active = true,
  count = 18,
  className,
  radius = 74,
}: {
  active?: boolean;
  count?: number;
  className?: string;
  radius?: number;
}) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const next: Particle[] = Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2 + Math.random() * 0.6;
      const distance = radius * (0.55 + Math.random() * 0.55);
      return {
        id: index,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance - radius * 0.18,
        rotate: Math.round((Math.random() - 0.5) * 360),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 5 + Math.round(Math.random() * 6),
        delay: Math.random() * 90,
        duration: 620 + Math.random() * 320,
      };
    });

    const frame = window.requestAnimationFrame(() => setParticles(next));
    const timer = window.setTimeout(() => setParticles([]), 1200);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [active, count, radius]);

  if (particles.length === 0) return null;

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-visible", className)} aria-hidden>
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="confetti-particle"
          style={
            {
              "--confetti-dx": `${particle.dx}px`,
              "--confetti-dy": `${particle.dy}px`,
              "--confetti-rotate": `${particle.rotate}deg`,
              "--confetti-delay": `${particle.delay}ms`,
              "--confetti-duration": `${particle.duration}ms`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
