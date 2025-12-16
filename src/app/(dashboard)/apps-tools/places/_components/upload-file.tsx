import { Label } from "@/components/ui/label";
import {
  DocumentAttachmentIcon,
  FileUploadIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React from "react";

export default function UploadFile({
  label,
  type,
}: {
  label: string;
  type?: "video" | "file";
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={label}>{label}</Label>
      <div className="!rounded-2xl bg-[#F3F3F3] px-3 flex items-center justify-between !h-[49px] border border-neutral-accent">
        <p>Upload document</p>
        <HugeiconsIcon
          icon={type === "video" ? FileUploadIcon : DocumentAttachmentIcon}
          size={24}
          color={"#6F6D6D"}
        />
      </div>
    </div>
  );
}
