import React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  /** Supporting text under the title. `hint` is accepted as an alias. */
  description?: string;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  hint,
  action,
  className,
}: EmptyStateProps) {
  const text = description ?? hint;

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-2 py-14 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-2 grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary [&_svg]:h-7 [&_svg]:w-7">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
      {text && <p className="max-w-sm text-sm text-muted-foreground">{text}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
