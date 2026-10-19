"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";

/**
 * Light / dark / system theme (class on <html>, saved by next-themes). Dark mode covers the
 * dashboard and Discover. The sign-in screens keep their light brand styling, so
 * they're forced to light. (Customer-facing pages live on the public site, places.spinstrip.com.)
 */
const LIGHT_ONLY_PREFIXES = ["/login", "/register", "/forgot-password", "/reset-password", "/otp-verification"];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const lightOnly = LIGHT_ONLY_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      forcedTheme={lightOnly ? "light" : undefined}
    >
      {children}
    </NextThemesProvider>
  );
}
