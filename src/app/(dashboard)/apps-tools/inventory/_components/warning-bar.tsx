import React from "react";
import { AlertTriangle } from "lucide-react";

export default function WarningBar({
  item,
  amount,
  moreCount = 0,
}: {
  item: string;
  amount: number;
  /** How many other items are also low on stock. */
  moreCount?: number;
}) {
  return (
    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-600">
        <AlertTriangle className="h-4 w-4" />
      </span>
      <p className="text-sm text-foreground">
        Your stock for <span className="font-bold italic">{item}</span> is running low (only {amount} left)
        {moreCount > 0 && `, and ${moreCount} other item${moreCount === 1 ? " is" : "s are"} low too`}. Restock soon
        to avoid missed orders.
      </p>
    </div>
  );
}
