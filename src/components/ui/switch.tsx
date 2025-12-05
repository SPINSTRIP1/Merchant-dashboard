"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  showLabel?: boolean;
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, checked, showLabel = true, ...props }, ref) => {
  if (showLabel)
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "flex items-center gap-x-2 w-fit px-2 py-1 rounded-full border",
          checked
            ? "bg-primary border-primary text-[#EBE2FF]"
            : "bg-transparent text-secondary-text border-neutral-accent"
        )}
      >
        {showLabel && (
          <p className="text-sm">{checked ? "Active" : "Activate"}</p>
        )}
        <SwitchPrimitives.Root
          className={cn(
            "peer inline-flex h-3.5 w-6 shrink-0 cursor-pointer items-center rounded-full border-[1.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
            className,
            checked ? "border-[#EBE2FF]" : "border-[#6F6D6D]"
          )}
          {...props}
          ref={ref}
        >
          <SwitchPrimitives.Thumb
            className={cn(
              "pointer-events-none block h-2 w-2 rounded-full  border-[1.5px] transition-transform",
              checked
                ? "border-[#EBE2FF] translate-x-3"
                : "border-[#6F6D6D] translate-x-0.5"
            )}
          />
        </SwitchPrimitives.Root>
      </div>
    );
  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-3.5 w-6 shrink-0 cursor-pointer border-[#6F6D6D] items-center rounded-full border-[1.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-2 w-2 rounded-full border-[#6F6D6D] border-[1.5px] transition-transform",
          checked ? "translate-x-3" : "translate-x-0.5"
        )}
      />
    </SwitchPrimitives.Root>
  );
});
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
