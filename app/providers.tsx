/**
 * Theme Providers Component
 * Client component that wraps the app with next-themes ThemeProvider and AuthProvider
 */

"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "../context/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}

