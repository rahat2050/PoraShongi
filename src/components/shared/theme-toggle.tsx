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
      className="inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      aria-label={theme === "light" ? "Dark mode চালু" : "Light mode চালু"}
    >
      {theme === "light" ? (
        <span key="light" className="theme-icon-switch">
          <Moon className="h-5 w-5" aria-hidden />
        </span>
      ) : (
        <span key="dark" className="theme-icon-switch">
          <Sun className="h-5 w-5" aria-hidden />
        </span>
      )}
    </button>
  );
}
