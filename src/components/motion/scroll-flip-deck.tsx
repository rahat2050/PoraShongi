"use client";

import { Children, useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

type ScrollFlipDeckProps = {
  eyebrow?: string;
  title: string;
  description: string;
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
  sectionId?: string;
  titleId?: string;
};

/**
 * Sticky, scroll-scrubbed 3D slide deck. Vertical scroll flips slides
 * from one side to the other (Keynote / Apple-product-page style) using
 * compositor variables only — no GSAP, no scroll-jacking.
 */
export function ScrollFlipDeck({
  eyebrow,
  title,
  description,
  label,
  hint = "স্ক্রল করলে স্লাইড 3D তে উল্টে যায়",
  children,
  className,
  sectionId,
  titleId,
}: ScrollFlipDeckProps) {
  const headingId = useId();
  const resolvedTitleId = titleId ?? headingId;
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const slideCount = Children.count(children);

  const collectSlides = useCallback(() => {
    const world = worldRef.current;
    if (!world) return [] as HTMLElement[];
    return Array.from(world.querySelectorAll<HTMLElement>("[data-deck-slide]"));
  }, []);

  const prefersReduced = useCallback(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const scrollToSlide = useCallback(
    (index: number) => {
      const track = trackRef.current;
      const slides = collectSlides();
      if (!track || slides.length === 0) return;
      const max = slides.length - 1;
      const target = clamp(index, 0, max);

      if (prefersReduced()) {
        slides[target]?.scrollIntoView({ behavior: "smooth", block: "center" });
        setActiveIndex(target);
        activeIndexRef.current = target;
        return;
      }

      const rect = track.getBoundingClientRect();
      const scrollable = Math.max(track.offsetHeight - window.innerHeight, 1);
      const top = window.scrollY + rect.top + (max === 0 ? 0 : (target / max) * scrollable);
      window.scrollTo({ top, behavior: "smooth" });
    },
    [collectSlides, prefersReduced],
  );

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const world = worldRef.current;
    if (!root || !track || !world) return;

    const slides = collectSlides();
    if (slides.length === 0) return;

    slides.forEach((slide, index) => {
      slide.style.setProperty("--slide-offset", String(index));
      slide.style.setProperty("--slide-abs", String(index));
      slide.dataset.slideIndex = String(index);
    });

    let frame: number | null = null;
    let swipeX = 0;
    let swipeY = 0;
    let swiping = false;
    let enabled = false;

    const applyStatic = () => {
      enabled = false;
      root.dataset.scrollDeckMotion = "static";
      slides.forEach((slide) => {
        slide.style.removeProperty("--slide-offset");
        slide.style.removeProperty("--slide-abs");
        slide.removeAttribute("data-active");
        slide.removeAttribute("data-visible");
        slide.setAttribute("aria-hidden", "false");
        const link = slide.querySelector<HTMLElement>("a, button");
        if (link) link.tabIndex = 0;
      });
    };

    const render = () => {
      frame = null;
      if (!enabled) return;
      const rect = track.getBoundingClientRect();
      const scrollable = Math.max(rect.height - window.innerHeight, 1);
      const progress = clamp(-rect.top / scrollable, 0, 1);
      const position = progress * Math.max(slides.length - 1, 0);

      slides.forEach((slide, index) => {
        const offset = index - position;
        const abs = Math.abs(offset);
        const active = abs < 0.5;
        slide.style.setProperty("--slide-offset", offset.toFixed(4));
        slide.style.setProperty("--slide-abs", abs.toFixed(4));
        slide.style.zIndex = String(Math.round(48 - abs * 12));
        slide.toggleAttribute("data-active", active);
        slide.setAttribute("data-visible", abs < 1.05 ? "true" : "false");
        slide.setAttribute("aria-hidden", active ? "false" : "true");
        const link = slide.querySelector<HTMLElement>("a, button");
        if (link) link.tabIndex = active ? 0 : -1;
      });

      const nextIndex = clamp(Math.round(position), 0, slides.length - 1);
      if (nextIndex !== activeIndexRef.current) {
        activeIndexRef.current = nextIndex;
        setActiveIndex(nextIndex);
      }
    };

    const schedule = () => {
      if (frame === null) frame = window.requestAnimationFrame(render);
    };

    const enable = () => {
      enabled = true;
      root.dataset.scrollDeckMotion = "enabled";
      schedule();
    };

    if (prefersReduced() || slides.length === 1) {
      applyStatic();
      return;
    }

    enable();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => {
      if (media.matches) {
        applyStatic();
        return;
      }
      enable();
    };
    media.addEventListener("change", onMotionChange);

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const target = event.target as HTMLElement | null;
      if (!root.contains(target) && document.activeElement !== root) return;
      event.preventDefault();
      scrollToSlide(activeIndexRef.current + (event.key === "ArrowRight" ? 1 : -1));
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      swiping = true;
      swipeX = event.clientX;
      swipeY = event.clientY;
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!swiping) return;
      swiping = false;
      const dx = event.clientX - swipeX;
      const dy = event.clientY - swipeY;
      if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy)) return;
      scrollToSlide(activeIndexRef.current + (dx < 0 ? 1 : -1));
    };

    root.addEventListener("keydown", onKey);
    world.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", onMotionChange);
      root.removeEventListener("keydown", onKey);
      world.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      if (frame !== null) window.cancelAnimationFrame(frame);
      root.removeAttribute("data-scroll-deck-motion");
    };
  }, [collectSlides, prefersReduced, scrollToSlide]);

  const total = Math.max(slideCount, 1);
  const progress = slideCount > 1 ? activeIndex / (slideCount - 1) : 1;

  return (
    <section
      ref={rootRef}
      id={sectionId}
      data-scroll-deck
      tabIndex={-1}
      className={cn("scroll-flip-deck relative bg-slate-950 outline-none", className)}
      aria-labelledby={resolvedTitleId}
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -left-24 top-24 h-80 w-80 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.18) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
            maskImage: "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:pt-24">
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_.7fr]">
          <div>
            {eyebrow ? (
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-200">{eyebrow}</p>
            ) : null}
            <h2 id={resolvedTitleId} className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              {title}
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-slate-200 lg:justify-self-end">{description}</p>
        </div>
      </div>

      <div
        ref={trackRef}
        className="scroll-flip-track relative"
        style={{ height: slideCount > 1 ? `calc(${Math.max(slideCount, 1)} * 72svh)` : undefined }}
      >
        <div className="scroll-flip-clip sticky top-16">
          <div className="scroll-flip-stage mx-auto flex h-full max-w-7xl flex-col px-4 sm:px-6">
            <div className="flex items-center justify-between gap-3 pt-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-200">{label}</p>
              <p className="hidden text-xs font-medium text-slate-200 sm:block">{hint}</p>
            </div>

            <div ref={worldRef} className="scroll-flip-world relative mt-3 min-h-0 flex-1" style={{ perspective: "1400px" }}>
              {children}
            </div>

            <div className="flex flex-col gap-3 pb-6 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold tabular-nums text-slate-200" aria-hidden>
                  {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
                <div
                  className="h-1.5 w-36 overflow-hidden rounded-full bg-white/10 sm:w-48"
                  role="progressbar"
                  aria-valuemin={1}
                  aria-valuemax={total}
                  aria-valuenow={activeIndex + 1}
                  aria-label="স্লাইড অগ্রগতি"
                >
                  <span className="block h-full rounded-full bg-gradient-to-r from-brand-400 to-amber-300" style={{ width: `${Math.max(progress, 0.08) * 100}%` }} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="mr-1 flex items-center gap-1.5">
                  {Array.from({ length: total }, (_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => scrollToSlide(index)}
                      aria-label={`স্লাইড ${index + 1}`}
                      aria-current={index === activeIndex ? "true" : undefined}
                      className={cn(
                        "h-2.5 rounded-full transition-all",
                        index === activeIndex ? "w-7 bg-white" : "w-2.5 bg-white/30 hover:bg-white/60",
                      )}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => scrollToSlide(activeIndex - 1)}
                  disabled={activeIndex <= 0}
                  aria-label="আগের স্লাইড"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-transparent disabled:text-slate-300"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSlide(activeIndex + 1)}
                  disabled={activeIndex >= total - 1}
                  aria-label="পরের স্লাইড"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-transparent disabled:text-slate-300"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {label}: স্লাইড {activeIndex + 1}
      </p>
    </section>
  );
}
