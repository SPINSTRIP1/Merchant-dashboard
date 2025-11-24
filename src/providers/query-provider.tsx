"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
// You might want to configure default options here (e.g., staleTime, gcTime)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      gcTime: 1000 * 60 * 5,
      staleTime: 1000 * 60 * 5,
      placeholderData: (prev: unknown) => prev,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
