"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import EmptyState from "@/components/empty-state";
import { Button } from "@/components/ui/button";

/** Blocks dashboard pages the current role can't open. Waiters are sent to the waiter app. */
export default function PermissionGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, canAccessPath, landingPath } = usePermissions();

  useEffect(() => {
    if (role === "waiter") router.replace("/waiter");
  }, [role, router]);

  if (role === "waiter") return null;

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
