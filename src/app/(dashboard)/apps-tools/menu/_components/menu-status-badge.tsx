import React from "react";
import { MenuStatus } from "../_schemas";

export default function MenuStatusBadge({ status }: { status: MenuStatus }) {
  const statusColors: Record<MenuStatus, string> = {
    AVAILABLE: "text-[#34C759] bg-[#34C75926]",
    PENDING: "text-[#FF8D28] bg-[#F6E9DD]",
    UNAVAILABLE: "text-[#FF383C] bg-[#C7343426]",
    DRAFT: "",
  };
  return (
    <div
      className={`${
        statusColors[status] || statusColors["AVAILABLE"]
      } w-[80px] flex items-center justify-center py-1 rounded-lg`}
    >
      <p className="font-semibold uppercase text-xxs">
        {status === "UNAVAILABLE" ? "OUT OF STOCK" : status}
      </p>
    </div>
  );
}
