import {
  AlertDiamondIcon,
  CheckmarkCircle02Icon,
  Clock05Icon,
  InformationDiamondIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React from "react";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  REJECTED: {
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    icon: InformationDiamondIcon,
    title: "Rejected - try again",
  },
  PENDING: {
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    icon: Clock05Icon,
    title: "Review Pending",
  },
  ACTIVE: {
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    icon: CheckmarkCircle02Icon,
    title: "Approved",
  },
  WARNING: {
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    icon: InformationDiamondIcon,
    title: "Warning",
  },
  UNVERIFIED: {
    className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    icon: AlertDiamondIcon,
    title: "Not Verified",
  },
};

/** Compliance-style status chip with an icon. For generic statuses use `StatusPill`. */
export default function StatusBadge({
  status,
  title,
}: {
  status: keyof typeof STATUS_STYLES;
  title?: string;
}) {
  const style = STATUS_STYLES[status];

  return (
    <span
      className={cn(
        "inline-flex h-fit items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        style.className
      )}
    >
      <HugeiconsIcon icon={style.icon} size={14} />
      {title || style.title}
    </span>
  );
}
