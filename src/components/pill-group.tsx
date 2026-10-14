import React from "react";
import { cn } from "@/lib/utils";

type Option<T extends string> = T | { value: T; label: React.ReactNode };

/** Single-choice pill buttons (a styled radio group). */
export default function PillGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label?: string;
  options: Option<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && <p className="mb-1.5 text-xs font-semibold text-foreground">{label}</p>}
      <div role="radiogroup" className="flex flex-wrap gap-2">
        {options.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;
          const selected = optionValue === value;
          return (
            <button
              key={optionValue}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(optionValue)}
              className={cn(
                "min-h-[36px] rounded-full border px-4 text-xs font-semibold transition-colors",
                selected
                  ? "brand-gradient border-transparent text-white shadow-md shadow-primary/25"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
