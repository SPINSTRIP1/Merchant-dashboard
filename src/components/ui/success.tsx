import {
  CheckmarkCircle01Icon,
  InformationDiamondIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import React from "react";

export default function Success({
  type = "success",
  icon,
}: {
  type?: "success" | "info";
  icon?: any;
}) {
  return (
    <div className="bg-white relative overflow-hidden p-3 rounded-full shadow-md">
      <HugeiconsIcon
        icon={
          icon ??
          (type === "success" ? CheckmarkCircle01Icon : InformationDiamondIcon)
        }
        size={24}
        color={type === "success" ? "#6932E2" : "#FF8D28"}
        className="z-[999]"
      />
      <Image
        src={type === "success" ? "/icons/check.svg" : "/icons/info.svg"}
        className="size-[36px] absolute opacity-60 -bottom-3 z-10 -left-3"
        width={40}
        height={40}
        alt="info"
      />
    </div>
  );
}
