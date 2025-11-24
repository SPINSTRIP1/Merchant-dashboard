import { cn } from "@/lib/utils";
import React from "react";
interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
  className?: string;
}

export default function StepIndicator({
  currentStep,
  steps,
  className,
}: StepIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center w-full mt-8 mb-20",
        className
      )}
    >
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        const isActiveOrCompleted = isActive || isCompleted;

        return (
          <div key={stepNumber} className="flex items-center">
            {/* Step Circle */}
            <div className={`relative`}>
              <div
                className={cn(
                  "p-2 md:p-2.5 w-fit rounded-full",
                  isActive ? "bg-primary-accent" : "bg-foreground"
                )}
              >
                <div
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full text-foreground flex items-center justify-center ${
                    isActiveOrCompleted ? "bg-primary" : "bg-[#C8C8C8]"
                  } `}
                >
                  <p className="lg:text-lg font-bold"> {stepNumber}</p>
                </div>
              </div>
              {/* Step Label - Only show for current step */}
              {isActive && (
                <div
                  className={cn(
                    "absolute -bottom-9 w-full min-w-[157px]",
                    currentStep === 1
                      ? "-left-14"
                      : currentStep === 2
                      ? "-left-12"
                      : "-left-12 -bottom-[50px]"
                  )}
                >
                  <p className="font-bold text-sm lg:text-base w-full text-center text-primary lg:mt-2">
                    {step}
                  </p>
                </div>
              )}
            </div>

            {/* Connecting Line - Don't show after last step */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-10 lg:w-20 h-px bg-gray-300",
                  index + 1 < currentStep ? "bg-primary" : "bg-neutral-accent"
                )}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
}
