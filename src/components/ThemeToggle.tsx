"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_THEME_KEY = "someone.help/theme";

export type ThemeChoice = "dark" | "warm";

function applyTheme(theme: ThemeChoice) {
  if (typeof document === "undefined") return;
  if (theme === "warm") {
    document.documentElement.setAttribute("data-theme", "warm");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeChoice>("dark");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_THEME_KEY);
      if (stored === "warm") {
        setTheme("warm");
        applyTheme("warm");
      }
    } catch {
      // ignore
    }
  }, []);

  const cycle = useCallback(() => {
    const next: ThemeChoice = theme === "dark" ? "warm" : "dark";
    setTheme(next);
    applyTheme(next);
    try {
      if (next === "dark") {
        localStorage.removeItem(STORAGE_THEME_KEY);
      } else {
        localStorage.setItem(STORAGE_THEME_KEY, next);
      }
    } catch {
      // ignore
    }
  }, [theme]);

  return (
    <button
      type="button"
      onClick={cycle}
      className="touch-manip min-h-11 min-w-11 sm:min-w-0 inline-flex items-center justify-center text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] active:opacity-80 transition rounded-lg px-3 py-2 border border-transparent hover:border-[var(--color-border)]"
      aria-label={
        theme === "dark"
          ? "Switch to warmer, cream-colored theme"
          : "Switch to darker theme"
      }
      title={theme === "dark" ? "warmer colors" : "darker colors"}
    >
      {theme === "dark" ? "warm" : "dark"}
    </button>
  );
}
