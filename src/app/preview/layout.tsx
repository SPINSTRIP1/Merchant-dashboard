"use client";

import { QueryProvider } from "@/providers/query-provider";

// Public consumer-facing pages (events, places, menu) fetch through React Query hooks,
// so they need the same QueryClient provider the dashboard has.
export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
