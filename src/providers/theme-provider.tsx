"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";

/**
 * Light / dark / system theme (class on <html>, saved by next-themes). Dark mode covers the
 * dashboard, the waiter app and Discover. The sign-in screens and the public consumer pages
 * (/preview/*) keep their light brand styling, so they're forced to light.
 */
const LIGHT_ONLY_PREFIXES = ["/preview", "/login", "/register", "/forgot-password", "/reset-password", "/otp-verification"];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const lightOnly = LIGHT_ONLY_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      forcedTheme={lightOnly ? "light" : undefined}
    >
      {children}
    </NextThemesProvider>
  );
}
