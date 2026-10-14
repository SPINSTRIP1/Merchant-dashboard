import React from "react";
import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Marks figures that come from mock data (src/mocks) rather than the backend, so merchants don't
 * mistake them for their own numbers. Remove from a screen once its real endpoint is wired up.
 */
export default function SampleDataBadge({
  className,
  label = "Sample data",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      title="These figures are illustrative while this report is being connected to your live data."
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-dashed border-amber-500/50 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400",
        className
      )}
    >
      <FlaskConical className="h-3 w-3" />
      {label}
    </span>
  );
}
