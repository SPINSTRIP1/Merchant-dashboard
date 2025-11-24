import StatusBadge from "@/components/status-badge";
import React from "react";

export default function WarningBar({
  item,
  amount,
}: {
  item: string;
  amount: number;
}) {
  return (
    <div className="bg-[#F6E9DD] flex mb-5 items-center gap-x-2 px-4 py-2 rounded-[32px]">
      <StatusBadge status="WARNING" />
      <p className="text-base text-primary-text">
        Your stock for <span className="font-bold italic">{item}</span> is
        running low (only {amount} left). Restock soon to avoid missed orders
      </p>
    </div>
  );
}
