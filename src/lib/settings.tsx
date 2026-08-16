"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Lang = "bn" | "en";
type Theme = "light" | "dark";

interface SettingsContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: (bn: string, en?: string) => string;
}

const SettingsContext = createContext<SettingsContextValue>({
  lang: "bn",
  setLang: () => {},
  theme: "light",
  toggleTheme: () => {},
  t: (bn) => bn,
});

/**
 * Language + Dark mode — localStorage-এ saved, Supabase-এ কোনো ডাটা লাগে না
 * (ডাটা/স্টোরেজ বাঁচানোর নিয়ম মেনে)।
 */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("bn");
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // localStorage (external store) থেকে hydrate — client mount-এ একবার (hydration-গার্ড pattern)।
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setLangState((localStorage.getItem("porasathi_lang") as Lang) || "bn");
    setTheme((localStorage.getItem("porasathi_theme") as Theme) || "light");
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("porasathi_lang", lang);
    document.documentElement.lang = lang;
  }, [lang, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("porasathi_theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, mounted]);

  const t = (bn: string, en?: string) => (lang === "en" && en ? en : bn);

  return (
    <SettingsContext.Provider
      value={{
        lang,
        setLang: setLangState,
        theme,
        toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
        t,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
