"use client";

import { QueryProvider } from "@/providers/query-provider";

// Public page outside the dashboard: needs its own React Query provider, like /preview.
export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
