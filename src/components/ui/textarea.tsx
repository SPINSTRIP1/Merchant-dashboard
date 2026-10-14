import * as React from "react";

import { cn } from "@/lib/utils";
import { inputClassName } from "./input";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(inputClassName, "flex min-h-[80px] py-3", className)}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
