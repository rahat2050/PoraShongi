"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Chrome/Edge fire `beforeinstallprompt` before showing their own banner.
 * We capture it so the user can install from a real, labelled button.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallButton() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installedByPrompt, setInstalledByPrompt] = useState(false);
  // Read the environment during render instead of in an effect: these values
  // never change for the lifetime of the page, so an effect would only cause
  // an extra render pass. `useState` with an initializer keeps it out of SSR.
  const [environment] = useState<{ standalone: boolean; isIos: boolean }>(() => {
    if (typeof window === "undefined") return { standalone: false, isIos: false };
    const ua = window.navigator.userAgent;
    return {
      standalone:
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true,
      // iOS Safari never fires beforeinstallprompt — it needs manual steps.
      isIos: /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS/.test(ua),
    };
  });

  const installed = environment.standalone || installedByPrompt;
  const isIos = environment.isIos;

  useEffect(() => {
    function onPrompt(event: Event) {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstalledByPrompt(true);
      setPromptEvent(null);
    }

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") setInstalledByPrompt(true);
    setPromptEvent(null);
  }

  if (installed) {
    return (
      <p className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
        <CheckCircle2 className="h-5 w-5" aria-hidden />
        PoraSathi ইতিমধ্যে আপনার ডিভাইসে ইনস্টল করা আছে
      </p>
    );
  }

  if (promptEvent) {
    return (
      <Button size="lg" onClick={install}>
        <Download className="h-5 w-5" aria-hidden />
        হোমস্ক্রিনে যোগ করুন
      </Button>
    );
  }

  if (isIos) {
    return (
      <p className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
        <Share className="h-5 w-5 shrink-0 text-brand-700 dark:text-brand-300" aria-hidden />
        Safari-তে নিচের <strong>Share</strong> বাটন চেপে <strong>Add to Home Screen</strong> বাছুন।
      </p>
    );
  }

  return (
    <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
      ব্রাউজারের মেনু থেকে <strong>&ldquo;Install app&rdquo;</strong> বা <strong>&ldquo;Add to Home screen&rdquo;</strong> বাছুন।
    </p>
  );
}
