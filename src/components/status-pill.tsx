import React from "react";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "muted";

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  info: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  muted: "bg-muted text-muted-foreground",
};

// Covers both the backend's upper-case enums and the prototype's lower-case statuses.
const STATUS_TONES: Record<string, Tone> = {
  success: "success",
  successful: "success",
  completed: "success",
  confirmed: "success",
  settled: "success",
  paid: "success",
  active: "success",
  live: "success",
  approved: "success",
  published: "success",
  available: "success",
  in_stock: "success",

  pending: "warning",
  review_pending: "warning",
  due: "warning",
  low_stock: "warning",
  paused: "warning",
  unverified: "warning",
  warning: "warning",
  unpublished: "warning",

  scheduled: "info",
  processing: "info",
  refunded: "info",

  failed: "danger",
  rejected: "danger",
  canceled: "danger",
  cancelled: "danger",
  inactive: "danger",
  out_of_stock: "danger",
  unavailable: "danger",
  no_show: "danger",

  expired: "muted",
  ended: "muted",
  draft: "muted",
  archived: "muted",
  not_started: "muted",
};

const normalise = (status: string) => status.trim().toLowerCase().replace(/[\s-]+/g, "_");

/** Coloured status chip. Pass `label` to override the text, `tone` to override the colour. */
export default function StatusPill({
  status,
  label,
  tone,
  className,
}: {
  status: string;
  label?: string;
  tone?: Tone;
  className?: string;
}) {
  const key = normalise(status);
  const resolvedTone = tone ?? STATUS_TONES[key] ?? "muted";

  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize",
        TONE_CLASSES[resolvedTone],
        className
      )}
    >
      {label ?? key.replace(/_/g, " ")}
    </span>
  );
}
