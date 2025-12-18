import { Label } from "@/components/ui/label";
import {
  DocumentAttachmentIcon,
  FileUploadIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React, { useRef, useState } from "react";

export default function UploadFile({
  label,
  type,
  onFileSelect,
  accept,
}: {
  label: string;
  type?: "video" | "file";
  onFileSelect?: (file: File | null) => void;
  accept?: string;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={label}>{label}</Label>
      <input
        ref={fileInputRef}
        type="file"
        id={label}
        className="hidden"
        onChange={handleFileChange}
        accept={accept || (type === "video" ? "video/*" : ".pdf,.doc,.docx")}
      />
      <div
        onClick={handleClick}
        className={`!rounded-2xl cursor-pointer bg-[#F3F3F3] px-3 flex items-center justify-between !h-[49px] border transition-colors ${
          selectedFile
            ? "border-green-500 bg-green-50"
            : "border-neutral-accent hover:bg-gray-200"
        }`}
      >
        <div className="flex-1 min-w-0">
          {selectedFile ? (
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          ) : (
            <p className="text-gray-600">Upload document</p>
          )}
        </div>
        <HugeiconsIcon
          icon={
            selectedFile
              ? Tick02Icon
              : type === "video"
              ? FileUploadIcon
              : DocumentAttachmentIcon
          }
          size={24}
          color={selectedFile ? "#22c55e" : "#6F6D6D"}
        />
      </div>
    </div>
  );
}
