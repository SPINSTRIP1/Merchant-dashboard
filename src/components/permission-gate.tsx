"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, Smartphone } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { useReduxAuth } from "@/hooks/use-redux-auth";
import EmptyState from "@/components/empty-state";
import { Button } from "@/components/ui/button";

/**
 * Blocks dashboard pages the current role can't open. Waiters have no dashboard access: they use
 * the separate SpinStrip waiter app, so they get a pointer there instead.
 */
export default function PermissionGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role, canAccessPath, landingPath } = usePermissions();
  const { logout } = useReduxAuth();

  if (role === "waiter") {
    return (
      <div className="rounded-2xl border bg-card">
        <EmptyState
          icon={<Smartphone />}
          title="Use the SpinStrip waiter app"
          description="Waiter accounts sign in to the SpinStrip waiter app to pick up orders and chat with guests. This dashboard is for restaurant owners and managers."
          action={
            <Button variant="outline" onClick={logout}>
              Sign out
            </Button>
          }
        />
      </div>
    );
  }

  if (!canAccessPath(pathname)) {
    return (
      <div className="rounded-2xl border bg-card">
        <EmptyState
          icon={<Lock />}
          title="You don't have access to this page"
          description="Ask the account owner to give your role access to this section."
          action={
            <Button asChild variant="brand">
              <Link href={landingPath}>Go to your dashboard</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return <>{children}</>;
}
