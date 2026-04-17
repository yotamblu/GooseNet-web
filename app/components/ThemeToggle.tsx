/**
 * Theme Toggle Button Component
 * Uses next-themes for proper App Router compatibility.
 * Visual: segmented sun/moon with smooth crossfade + rotate.
 */

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const reduce = useReducedMotion();

  // Prevent hydration mismatch and track the actual class on <html>.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (mounted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, [theme, mounted]);

  const btnBase =
    "relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl " +
    "border border-gray-200 dark:border-white/10 " +
    "bg-white/80 dark:bg-gray-900/60 backdrop-blur-md " +
    "text-gray-700 dark:text-gray-200 " +
    "shadow-sm hover:shadow-md transition-all " +
    "hover:bg-white dark:hover:bg-gray-900 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 " +
    "focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900";

  if (!mounted) {
    return (
      <button type="button" className={btnBase} aria-label="Toggle theme" disabled>
        <svg className="h-4.5 w-4.5 h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>
    );
  }

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileTap={reduce ? undefined : { scale: 0.92 }}
      className={btnBase}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.svg
            key="moon"
            initial={reduce ? { opacity: 0 } : { rotate: -90, opacity: 0, scale: 0.6 }}
            animate={reduce ? { opacity: 1 } : { rotate: 0, opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { rotate: 90, opacity: 0, scale: 0.6 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 360, damping: 24 }}
            className="h-[18px] w-[18px]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </motion.svg>
        ) : (
          <motion.svg
            key="sun"
            initial={reduce ? { opacity: 0 } : { rotate: 90, opacity: 0, scale: 0.6 }}
            animate={reduce ? { opacity: 1 } : { rotate: 0, opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { rotate: -90, opacity: 0, scale: 0.6 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 360, damping: 24 }}
            className="h-[18px] w-[18px]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
