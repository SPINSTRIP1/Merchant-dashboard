import {
  AlertDiamondIcon,
  CheckmarkCircle02Icon,
  Clock05Icon,
  InformationDiamondIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React from "react";

export default function StatusBadge({
  status,
  title,
}: {
  status: "REJECTED" | "PENDING" | "ACTIVE" | "WARNING" | "UNVERIFIED";
  title?: string;
}) {
  const statusColors = {
    REJECTED: {
      text: "#FF383C",
      bg: "#F6DDDD",
      border: "#FF383C",
      icon: InformationDiamondIcon,
      title: "Rejected - try again",
    },
    PENDING: {
      text: "#FF8D28",
      bg: "#F6E9DD",
      border: "#FF8D28",
      icon: Clock05Icon,
      title: "Review Pending",
    },
    ACTIVE: {
      text: "#34C759",
      bg: "#DDF6E2",
      border: "#34C759",
      icon: CheckmarkCircle02Icon,
      title: "Approved",
    },
    WARNING: {
      text: "#FF8D28",
      bg: "#F6E9DD",
      border: "#FF8D28",
      icon: InformationDiamondIcon,
      title: "WARNING",
    },
    UNVERIFIED: {
      text: "#8B6914",
      bg: "#FFFBEB",
      border: "#8B6914",
      icon: AlertDiamondIcon,
      title: "Not Verified",
    },
  };

  return (
    <div
      style={{
        color: statusColors[status].text,
        backgroundColor: statusColors[status].bg,
        borderColor: statusColors[status].border,
      }}
      className="flex gap-x-1 items-center p-1 border rounded-full"
    >
      <HugeiconsIcon
        icon={statusColors[status].icon}
        size={16}
        color={statusColors[status].text}
      />
      <p className="text-[9px] font-medium uppercase">
        {title || statusColors[status].title}
      </p>
    </div>
  );
}
