"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useComplianceStatus } from "@/hooks/use-compliance";
import { usePermissions } from "@/hooks/use-permissions";
import StatusBadge from "@/components/status-badge";

const CTA_LABEL = {
  REJECTED: "Retry Compliance",
  PENDING: "Review Compliance Results",
  UNVERIFIED: "Complete Compliance",
} as const;

/** Compliance progress strip shown above dashboard pages until the merchant is approved. */
export default function ComplianceBanner() {
  const { data: status, percent, isLoading } = useComplianceStatus();
  const { can } = usePermissions();
  const pathname = usePathname();

  if (
    isLoading ||
    status === "VERIFIED" ||
    pathname.startsWith("/settings/compliance")
  )
    return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border bg-card p-4"
    >
      <span className="text-sm font-medium text-foreground">
        Compliance Status
      </span>
      <StatusBadge status={status} />
      <div className="flex min-w-[140px] flex-1 items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="brand-gradient h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(percent, 5)}%` }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          {percent}%
        </span>
      </div>
      {can("settings") && (
        <Link
          href="/settings/compliance"
          className="ml-auto inline-flex min-h-[40px] items-center gap-2 rounded-full bg-primary/10 px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          {CTA_LABEL[status]}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </motion.div>
  );
}
