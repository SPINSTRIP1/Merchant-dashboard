import React from "react";
import { ChevronDown } from "lucide-react";
import { MenuStatus } from "../_schemas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<MenuStatus, { label: string; pill: string; dot: string }> = {
  AVAILABLE: {
    label: "Available",
    pill: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  PENDING: {
    label: "Pending",
    pill: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  UNAVAILABLE: {
    label: "Out of Stock",
    pill: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500",
  },
  DRAFT: {
    label: "Draft",
    pill: "border-border bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

const SELECTABLE: MenuStatus[] = ["AVAILABLE", "PENDING", "UNAVAILABLE"];

/** Menu item status pill; pass `onStatusChange` + `menuId` to make it a dropdown. */
export default function MenuStatusBadge({
  status,
  onStatusChange,
  menuId,
}: {
  status: MenuStatus;
  onStatusChange?: (menuId: string, newStatus: MenuStatus) => void;
  menuId?: string;
}) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT;
  const pillClass =
    "inline-flex h-8 min-w-[120px] items-center justify-center gap-1 rounded-full border px-3 text-[10px] font-bold uppercase tracking-wide";

  if (!onStatusChange || !menuId) {
    return <span className={cn(pillClass, style.pill)}>{style.label}</span>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onClick={(e) => e.stopPropagation()}
        className={cn(pillClass, style.pill, "outline-none transition-opacity hover:opacity-80")}
        aria-label={`Status: ${style.label}. Change status`}
      >
        {style.label}
        <ChevronDown className="h-3 w-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44 rounded-xl" onClick={(e) => e.stopPropagation()}>
        {SELECTABLE.map((value) => (
          <DropdownMenuItem
            key={value}
            onClick={(e) => {
              e.stopPropagation();
              if (value !== status) onStatusChange(menuId, value);
            }}
            className="flex cursor-pointer items-center gap-2 text-xs"
          >
            <span className={cn("h-2 w-2 rounded-full", STATUS_STYLES[value].dot)} />
            {STATUS_STYLES[value].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
