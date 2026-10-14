import React from "react";
import { cn } from "@/lib/utils";

/** Segmented progress for multi-step forms. `currentStep` is 1-based. */
export default function StepProgress({
  steps,
  currentStep,
  className,
}: {
  steps: string[];
  currentStep: number;
  className?: string;
}) {
  return (
    <ol className={cn("flex gap-2", className)} aria-label="Form progress">
      {steps.map((step, i) => {
        const stepNumber = i + 1;
        const reached = stepNumber <= currentStep;
        return (
          <li
            key={step}
            className="flex-1"
            aria-current={stepNumber === currentStep ? "step" : undefined}
          >
            <div
              className={cn(
                "h-1.5 rounded-full transition-colors duration-300",
                reached ? "brand-gradient" : "bg-muted"
              )}
            />
            <p
              className={cn(
                "mt-1.5 truncate text-[10px] font-semibold",
                stepNumber === currentStep ? "text-primary" : "text-muted-foreground"
              )}
            >
              {step}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
