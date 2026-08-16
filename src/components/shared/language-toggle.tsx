"use client";

import { Languages } from "lucide-react";
import { useSettings } from "@/lib/settings";

/** বাংলা/English toggle — localStorage-এ saved। */
export function LanguageToggle() {
  const { lang, setLang } = useSettings();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === "bn" ? "en" : "bn")}
      className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      aria-label="ভাষা বদলান"
    >
      <Languages className="h-4 w-4" aria-hidden />
      {lang === "bn" ? "EN" : "বাং"}
    </button>
  );
}
