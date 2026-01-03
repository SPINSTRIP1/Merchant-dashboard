"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface MonthDayPickerProps {
  value?: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

export function MonthDayPicker({
  value,
  onChange,
  children,
}: MonthDayPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState<number | null>(
    () => {
      if (value) {
        const [month] = value.split("-").map(Number);
        return month - 1;
      }
      return null;
    }
  );

  const getDaysInMonth = (month: number) => {
    // Using a non-leap year for simplicity (2023)
    return new Date(2023, month + 1, 0).getDate();
  };

  const handleDaySelect = (day: number) => {
    if (selectedMonth !== null) {
      const monthStr = String(selectedMonth + 1).padStart(2, "0");
      const dayStr = String(day).padStart(2, "0");
      onChange(`${monthStr}-${dayStr}`);
      setOpen(false);
    }
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    if (selectedMonth === null) {
      setSelectedMonth(direction === "next" ? 0 : 11);
    } else {
      setSelectedMonth((prev) => {
        if (prev === null) return 0;
        if (direction === "next") {
          return prev === 11 ? 0 : prev + 1;
        }
        return prev === 0 ? 11 : prev - 1;
      });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          {/* Month selector */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleMonthChange("prev")}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-semibold text-sm">
              {selectedMonth !== null ? MONTHS[selectedMonth] : "Select Month"}
            </span>
            <button
              type="button"
              onClick={() => handleMonthChange("next")}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Days grid */}
          {selectedMonth !== null && (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: getDaysInMonth(selectedMonth) }, (_, i) => {
                const day = i + 1;
                const monthStr = String(selectedMonth + 1).padStart(2, "0");
                const dayStr = String(day).padStart(2, "0");
                const isSelected = value === `${monthStr}-${dayStr}`;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDaySelect(day)}
                    className={cn(
                      "h-8 w-8 text-sm rounded hover:bg-gray-100 transition-colors",
                      isSelected && "bg-primary text-white hover:bg-primary/90"
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
