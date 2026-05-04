"use client";

import { createContext, startTransition, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_THEME, getTheme, THEME_COOKIE, THEME_STORAGE_KEY, type AppTheme } from "@/theme/config";

interface ThemeContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: AppTheme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.classList.toggle("light", theme === "light");
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({
  children,
  initialTheme = DEFAULT_THEME,
}: {
  children: ReactNode;
  initialTheme?: AppTheme;
}) {
  const router = useRouter();
  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (typeof window === "undefined") {
      return getTheme(initialTheme);
    }

    try {
      return getTheme(localStorage.getItem(THEME_STORAGE_KEY) || initialTheme);
    } catch {
      return getTheme(initialTheme);
    }
  });
  const hasMountedRef = useRef(false);

  useEffect(() => {
    const nextTheme = getTheme(theme);
    const normalizedInitialTheme = getTheme(initialTheme);

    applyTheme(nextTheme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Ignore storage write failures
    }

    document.cookie = `${THEME_COOKIE}=${nextTheme}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;

    const shouldRefresh = hasMountedRef.current || nextTheme !== normalizedInitialTheme;
    if (shouldRefresh) {
      startTransition(() => {
        router.refresh();
      });
    }

    hasMountedRef.current = true;
  }, [initialTheme, router, theme]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    setTheme: (nextTheme) => setThemeState(getTheme(nextTheme)),
    toggleTheme: () => setThemeState((current) => (current === "dark" ? "light" : "dark")),
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
