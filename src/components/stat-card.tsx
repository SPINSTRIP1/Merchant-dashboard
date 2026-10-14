"use client";

import React from "react";
import { motion } from "framer-motion";
import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * KPI tile. `index` staggers the entrance animation in a grid; `accent` renders the
 * gradient variant (use for at most one headline number per row).
 */
export default function StatCard({
  label,
  value,
  sub,
  icon,
  index = 0,
  accent = false,
  sample = false,
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  index?: number;
  accent?: boolean;
  /** Marks the figure as sample data (see SampleDataBadge). */
  sample?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 + index * 0.05, ease: "easeOut" }}
      className={cn(
        "card-hover rounded-2xl border bg-card p-4 md:p-5",
        accent && "brand-gradient border-transparent text-white",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={cn(
              "flex items-center gap-1 truncate text-xs font-medium",
              accent ? "text-white/80" : "text-muted-foreground"
            )}
          >
            {label}
            {sample && (
              <FlaskConical
                aria-label="Sample data"
                className={cn("h-3 w-3 shrink-0", accent ? "text-white/70" : "text-amber-500")}
              >
                <title>Sample data</title>
              </FlaskConical>
            )}
          </p>
          <p
            className={cn(
              "mt-1.5 font-display text-xl font-bold tracking-tight md:text-2xl",
              !accent && "text-foreground"
            )}
          >
            {value}
          </p>
          {sub && (
            <p className={cn("mt-1 text-[11px]", accent ? "text-white/75" : "text-muted-foreground")}>
              {sub}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-xl [&_svg]:h-4 [&_svg]:w-4",
              accent ? "bg-white/15 text-white" : "bg-primary/10 text-primary"
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}
