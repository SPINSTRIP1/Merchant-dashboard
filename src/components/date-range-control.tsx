"use client";

import React, { useState } from "react";
import { CalendarIcon, ChevronDown } from "lucide-react";
import type { DateRange as DayPickerRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { fmtDate, rangeFor, type DateRange, type RangePreset } from "@/utils";

const PRESETS: { key: RangePreset; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "year", label: "This Year" },
  { key: "custom", label: "Custom" },
];

/** Preset segmented control plus a date-range popover. Value shape matches `rangeFor`. */
export default function DateRangeControl({
  value,
  onChange,
  className,
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const selectPreset = (preset: RangePreset) => {
    if (preset === "custom") {
      setOpen(true);
      onChange({ ...value, preset: "custom" });
      return;
    }
    onChange(rangeFor(preset));
  };

  const selectDays = (range: DayPickerRange | undefined) => {
    if (!range?.from) return;
    const to = new Date(range.to ?? range.from);
    to.setHours(23, 59, 59, 999);
    onChange({ preset: "custom", from: range.from, to });
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="flex flex-wrap items-center gap-1 rounded-full border bg-card p-1">
        {PRESETS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => selectPreset(key)}
            className={cn(
              "inline-flex min-h-[36px] items-center gap-1 rounded-full px-3.5 text-xs font-semibold transition-all",
              value.preset === key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
            {key === "custom" && <ChevronDown className="h-3 w-3" />}
          </button>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border bg-card px-4 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <CalendarIcon className="h-4 w-4" />
            {fmtDate(value.from)} — {fmtDate(value.to)}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto rounded-2xl p-0">
          <Calendar
            mode="range"
            numberOfMonths={1}
            selected={{ from: value.from, to: value.to }}
            onSelect={selectDays}
            disabled={{ after: new Date() }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
