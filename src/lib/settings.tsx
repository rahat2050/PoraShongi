"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface SettingsContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  theme: "light",
  toggleTheme: () => {},
});

/** Dark mode preference saved locally; no account or database data is used. */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setTheme(localStorage.getItem("porasathi_theme") === "dark" ? "dark" : "light");
    // Remove the former partial-language preference. Bengali is the only
    // supported document language until complete translations are available.
    localStorage.removeItem("porasathi_lang");
    document.documentElement.lang = "bn";
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("porasathi_theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, mounted]);

  return (
    <SettingsContext.Provider
      value={{
        theme,
        toggleTheme: () => setTheme((value) => (value === "light" ? "dark" : "light")),
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
