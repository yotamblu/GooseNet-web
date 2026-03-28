/**
 * Theme Providers Component
 * Client component that wraps the app with next-themes ThemeProvider and AuthProvider
 */

"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { useEffect } from "react";
import { AuthProvider } from "../context/AuthContext";
import { THEME_STORAGE_KEY } from "../lib/theme-storage";

/**
 * next-themes can leave React state undefined after SSR while the inline script already
 * ran; syncing when storage is empty/invalid forces default dark to match DOM + setTheme.
 * Also re-checks on focus/storage so clearing localStorage in DevTools recovers dark.
 */
function ThemeDefaultSync() {
  const { setTheme } = useTheme();

  useEffect(() => {
    const sync = () => {
      try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored !== "light" && stored !== "dark") {
          setTheme("dark");
        }
      } catch {
        setTheme("dark");
      }
    };

    sync();
    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
    };
  }, [setTheme]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey={THEME_STORAGE_KEY}
    >
      <ThemeDefaultSync />
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}

