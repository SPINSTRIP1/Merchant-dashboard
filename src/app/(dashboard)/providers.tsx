"use client";
import AuthProvider from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";

// Main page component
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QueryProvider>{children}</QueryProvider>
    </AuthProvider>
  );
}
