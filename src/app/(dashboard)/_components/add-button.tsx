import { PlusSignSquareIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React from "react";

export default function AddButton({
  onClick,
  title,
}: {
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl bg-primary h-12 md:h-10 text-white flex justify-center items-center gap-2 px-4"
    >
      <HugeiconsIcon icon={PlusSignSquareIcon} size={24} color="#FFFFFF" />
      <p className="font-normal">{title}</p>
    </button>
  );
}
