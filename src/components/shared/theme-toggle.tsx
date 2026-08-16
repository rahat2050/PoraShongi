"use client";

import { Moon, Sun } from "lucide-react";
import { useSettings } from "@/lib/settings";

/** Dark mode toggle — কোনো ডাটা লাগে না (localStorage)। */
export function ThemeToggle() {
  const { theme, toggleTheme } = useSettings();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      aria-label={theme === "light" ? "Dark mode চালু" : "Light mode চালু"}
    >
      {theme === "light" ? <Moon className="h-5 w-5" aria-hidden /> : <Sun className="h-5 w-5" aria-hidden />}
    </button>
  );
}
