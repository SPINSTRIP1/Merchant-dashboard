import { Label } from "@/components/ui/label";
import {
  DocumentAttachmentIcon,
  FileUploadIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React, { useRef } from "react";
import { Control, FieldValues, Path, useController } from "react-hook-form";
import { cn } from "@/lib/utils";

interface UploadFileProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  type?: "video" | "file";
  accept?: string;
  description?: string;
}

export function UploadFile<T extends FieldValues>({
  control,
  name,
  label,
  type,
  accept,
  description,
}: UploadFileProps<T>) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const fieldValue = field.value as File | string | null | undefined;

  // Check if field value is a URL string
  const isUrlString =
    typeof fieldValue === "string" && fieldValue.startsWith("http");
  const selectedFile = isUrlString
    ? null
    : (fieldValue as File | null | undefined);

  // Check if we have any value (File or URL)
  const hasValue = !!fieldValue;

  // Get filename from URL if it's a URL string
  // URL format: https://.../.../1766494240466-test1.mp4
  const getFileNameFromUrl = (url: string): string => {
    try {
      const pathname = new URL(url).pathname;
      const fullFilename = pathname.split("/").pop() || "Uploaded file";
      // Split by dash and get the last part (e.g., "1766494240466-test1.mp4" -> "test1.mp4")
      const parts = fullFilename.split("-");
      return parts.length > 1 ? parts.slice(1).join("-") : fullFilename;
    } catch {
      return "Uploaded file";
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    field.onChange(file);
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
      <Label htmlFor={name}>{label}</Label>
      <input
        ref={fileInputRef}
        type="file"
        id={name}
        className="hidden"
        onChange={handleFileChange}
        accept={accept || (type === "video" ? "video/*" : ".pdf,.doc,.docx")}
      />
      <div
        onClick={handleClick}
        className={cn(
          "!rounded-2xl cursor-pointer bg-[#F3F3F3] px-3 flex items-center justify-between !h-[49px] border transition-colors",
          hasValue
            ? "border-green-500 bg-green-50"
            : "border-neutral-accent hover:bg-gray-200",
          error && "border-red-500"
        )}
      >
        <div className="flex-1 min-w-0">
          {hasValue ? (
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedFile
                  ? selectedFile.name
                  : isUrlString
                  ? getFileNameFromUrl(fieldValue as string)
                  : "File uploaded"}
              </p>
              <p className="text-xs text-gray-500">
                {selectedFile
                  ? formatFileSize(selectedFile.size)
                  : "Click to replace"}
              </p>
            </div>
          ) : (
            <p className="text-gray-600">
              Upload {type === "video" ? "video" : "document"}
            </p>
          )}
        </div>
        <HugeiconsIcon
          icon={
            hasValue
              ? Tick02Icon
              : type === "video"
              ? FileUploadIcon
              : DocumentAttachmentIcon
          }
          size={24}
          color={hasValue ? "#22c55e" : error ? "#ef4444" : "#6F6D6D"}
        />
      </div>
      {description && !error && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      {error && (
        <p className="text-sm font-medium text-destructive">{error.message}</p>
      )}
    </div>
  );
}
