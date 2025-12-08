import { cn } from "@/lib/utils";
import { PlusSignSquareIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React from "react";

export default function AddButton({
  onClick,
  title,
  className,
}: {
  onClick: () => void;
  title: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-2xl bg-primary h-12 md:h-10 text-white flex justify-center items-center gap-x-1.5 px-3",
        className
      )}
    >
      <HugeiconsIcon
        icon={PlusSignSquareIcon}
        size={22}
        color={className ? "#6932e2" : "#FFFFFF"}
      />
      <p className="font-normal text-sm">{title}</p>
    </button>
  );
}
