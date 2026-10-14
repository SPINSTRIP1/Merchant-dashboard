"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Card wrapper for charts and lists: title, subtitle and an optional top-right action. */
export default function ChartCard({
  title,
  subtitle,
  action,
  delay = 0,
  className,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={cn("rounded-2xl border bg-card p-5", className)}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display text-base font-bold text-foreground">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0 text-xs font-semibold text-primary">{action}</div>}
      </div>
      {children}
    </motion.section>
  );
}
