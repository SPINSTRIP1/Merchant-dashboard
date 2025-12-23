"use client";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const MaxWidthWrapper = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div
      className={cn(
        "h-full mx-auto max-w-[1280px] w-full p-2.5 lg:p-5",
        className
      )}
    >
      {children}
    </div>
  );
};

export default MaxWidthWrapper;
