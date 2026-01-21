"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import "react-day-picker/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        button_previous:
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md hover:bg-gray-100 absolute top-3 left-1",
        button_next:
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md hover:bg-gray-100 absolute top-3 right-1",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative",
        day_button:
          "h-9 w-9 p-0 font-normal rounded-md inline-flex items-center justify-center cursor-pointer",
        selected:
          "bg-[#2C2C2C] text-white focus:bg-[#2C2C2C] !hover:bg-[#2C2C2C] focus:text-white rounded-md",
        today: "bg-gray-100 text-gray-900 rounded-md",
        outside: "text-gray-400 opacity-50",
        disabled: "text-gray-400 opacity-50 cursor-not-allowed",
        range_middle: "bg-[#2C2C2C]/10 rounded-none",
        range_start: "rounded-l-md",
        range_end: "rounded-r-md",
        hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
