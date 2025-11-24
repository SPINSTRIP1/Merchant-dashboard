"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useReduxAuth } from "@/hooks/use-redux-auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useReduxAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user is authenticated using AuthManager
    const checkAuth = async () => {
      const isLoggedIn = auth.isAuthenticated;
      const hasValidToken = auth.accessToken !== null;

      if (pathname === "/login") {
        if (isLoggedIn && hasValidToken) {
          // If already authenticated and on login page, redirect to dashboard
          router.push("/");
        } else {
          setIsAuthenticated(false);
        }
      } else if (pathname.startsWith("/")) {
        if (!isLoggedIn || !hasValidToken) {
          // If not authenticated and trying to access admin pages, redirect to login
          router.push("/login");
        } else {
          setIsAuthenticated(true);
        }
      }
    };

    checkAuth();
  }, [pathname, router, auth]);

  // Show loading state while checking authentication
  if (
    isAuthenticated === null &&
    pathname.startsWith("/") &&
    pathname !== "/login"
  ) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-night"></div>
      </div>
    );
  }

  return <>{children}</>;
}
