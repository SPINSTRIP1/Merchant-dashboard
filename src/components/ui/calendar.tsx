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
        caption_label: "font-display text-sm font-semibold text-foreground",
        nav: "flex items-center gap-1",
        button_previous:
          "h-7 w-7 bg-transparent p-0 text-muted-foreground hover:text-foreground inline-flex items-center justify-center rounded-full hover:bg-muted absolute top-3 left-1",
        button_next:
          "h-7 w-7 bg-transparent p-0 text-muted-foreground hover:text-foreground inline-flex items-center justify-center rounded-full hover:bg-muted absolute top-3 right-1",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-muted-foreground w-9 font-medium text-[0.75rem]",
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative",
        day_button:
          "h-9 w-9 p-0 font-normal rounded-full inline-flex items-center justify-center cursor-pointer text-foreground hover:bg-muted",
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary rounded-full",
        today: "font-bold [&>button]:text-primary",
        outside: "opacity-40",
        disabled: "opacity-40 [&>button]:cursor-not-allowed",
        range_middle: "bg-primary/10 rounded-none [&>button]:!bg-transparent [&>button]:!text-foreground",
        range_start: "rounded-l-full bg-primary/10",
        range_end: "rounded-r-full bg-primary/10",
        hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
