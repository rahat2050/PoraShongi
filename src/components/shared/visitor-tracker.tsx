"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isTrackableVisitorPath } from "@/lib/analytics/visitor";

type PrivacyAwareNavigator = Navigator & {
  globalPrivacyControl?: boolean;
};

/**
 * Sends a non-blocking aggregate ping for public routes only. No visitor ID,
 * route history, device detail, or personal information is transmitted.
 */
export function VisitorTracker({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const lastScheduledPath = useRef<string | null>(null);

  useEffect(() => {
    const privacyNavigator = navigator as PrivacyAwareNavigator;
    if (
      !enabled
      || process.env.NODE_ENV !== "production"
      || navigator.webdriver
      || navigator.doNotTrack === "1"
      || privacyNavigator.globalPrivacyControl === true
      || !isTrackableVisitorPath(pathname)
      || lastScheduledPath.current === pathname
    ) {
      return;
    }

    lastScheduledPath.current = pathname;
    let idleId: number | null = null;
    let timeoutId: number | null = null;
    let cancelled = false;

    const send = () => {
      if (cancelled) return;
      void fetch("/api/analytics/visit", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname }),
      }).catch(() => {
        // Analytics must never interrupt browsing.
      });
    };

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(send, { timeout: 1500 });
    } else {
      timeoutId = window.setTimeout(send, 700);
    }

    return () => {
      cancelled = true;
      if (idleId !== null) window.cancelIdleCallback(idleId);
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [enabled, pathname]);

  return null;
}
