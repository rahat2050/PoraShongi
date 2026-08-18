"use client";

import { useCallback, useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const PRECISE_POINTER_QUERY = "(hover: hover) and (pointer: fine) and (min-width: 1024px)";

function useMediaQuery(query: string, serverSnapshot: boolean) {
  const subscribe = useCallback((onChange: () => void) => {
    const media = window.matchMedia(query);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = useCallback(() => serverSnapshot, [serverSnapshot]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Defaults to reduced motion while server-rendering, then follows the user's
 * live operating-system preference after hydration.
 */
export function usePrefersReducedMotion() {
  return useMediaQuery(REDUCED_MOTION_QUERY, true);
}

/** Pointer-driven depth is intentionally limited to precise desktop pointers. */
export function useCanUsePointerMotion() {
  const reducedMotion = usePrefersReducedMotion();
  const precisePointer = useMediaQuery(PRECISE_POINTER_QUERY, false);
  return precisePointer && !reducedMotion;
}
