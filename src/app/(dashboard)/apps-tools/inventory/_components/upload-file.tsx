"use client";
import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  DragEvent,
  ChangeEvent,
} from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DocumentAttachmentIcon,
  ImageAdd01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

export type FileUploadType = "image" | "file";

interface FileUploadProps {
  type?: FileUploadType;
  className?: string;
  onFileSelect?: (file: File | null) => void;
  acceptedFormats?: string[];
  maxSizeInMB?: number;
  label?: string;
  fileName: string;
}

// File type mappings for better performance
const FILE_TYPE_MAP: Record<string, string> = {
  PDF: ".pdf",
  DOC: ".doc",
  DOCX: ".docx",
  XLS: ".xls",
  XLSX: ".xlsx",
  TXT: ".txt",
} as const;

// Default accepted formats
const DEFAULT_IMAGE_FORMATS = ["JPG", "JPEG", "PNG", "SVG", "WEBP"];
const DEFAULT_FILE_FORMATS = ["PDF", "DOC", "DOCX", "XLS", "XLSX", "TXT"];

export default function UploadFile({
  type = "image",
  className,
  onFileSelect,
  acceptedFormats = type === "image"
    ? DEFAULT_IMAGE_FORMATS
    : DEFAULT_FILE_FORMATS,
  maxSizeInMB = 10,
  label,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memoized computations
  const acceptString = useMemo(() => {
    if (type === "image") return "image/*";

    return acceptedFormats
      .map(
        (format) =>
          FILE_TYPE_MAP[format.toUpperCase()] || `.${format.toLowerCase()}`
      )
      .join(",");
  }, [type, acceptedFormats]);

  const maxSizeBytes = useMemo(() => maxSizeInMB * 1024 * 1024, [maxSizeInMB]);

  const acceptedFormatsUpperCase = useMemo(
    () => acceptedFormats.map((f) => f.toUpperCase()),
    [acceptedFormats]
  );

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxSizeBytes) {
        return `File size must be less than ${maxSizeInMB}MB`;
      }

      const fileExtension = file.name.split(".").pop()?.toUpperCase();
      if (fileExtension && !acceptedFormatsUpperCase.includes(fileExtension)) {
        return `File type not supported. Accepted formats: ${acceptedFormats.join(
          ", "
        )}`;
      }

      return null;
    },
    [maxSizeBytes, maxSizeInMB, acceptedFormatsUpperCase, acceptedFormats]
  );

  const handleFileSelect = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
        setImagePreview(null);
        onFileSelect?.(null);
        return;
      }

      setError("");
      setSelectedFile(file);
      onFileSelect?.(file);

      // Create image preview for image files
      if (type === "image" && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [validateFile, onFileSelect, type]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    setImagePreview(null);
    setError("");
    onFileSelect?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onFileSelect]);

  // Memoized icon selection
  const iconComponent = useMemo(
    () => (type === "image" ? ImageAdd01Icon : DocumentAttachmentIcon),
    [type]
  );

  // Memoized file size display
  const fileSizeDisplay = useMemo(() => {
    if (!selectedFile) return null;
    return `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`;
  }, [selectedFile]);

  return (
    <div className="space-y-2.5 w-full max-w-[158px]">
      <div
        className={cn(
          "rounded-2xl h-[169px] w-full  bg-[#F3F3F3] border border-neutral-accent flex gap-y-2.5 flex-col items-center justify-center transition-all duration-200 cursor-pointer",
          isDragOver && "border-primary bg-primary-accent/20",
          error && "border-red-500 bg-red-50",
          selectedFile && "border-green-500 bg-green-50",
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptString}
          onChange={handleInputChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-2 w-full h-full p-2">
            {type === "image" && imagePreview ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt={selectedFile.name}
                  className="w-full max-h-[120px] object-cover rounded-lg"
                />
                <p className="text-xs text-green-600 truncate max-w-full px-2">
                  {selectedFile.name}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="text-xs text-red-500 hover:text-red-700 underline"
                  type="button"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <HugeiconsIcon
                  icon={iconComponent}
                  size={48}
                  color="#22c55e"
                  strokeWidth={0.9}
                />
                <p className="text-sm font-medium text-green-700 truncate max-w-full px-2">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-green-600">
                  {fileSizeDisplay || "File selected"}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="text-xs text-red-500 hover:text-red-700 underline"
                  type="button"
                >
                  Remove file
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <HugeiconsIcon
              icon={iconComponent}
              size={48}
              color={error ? "#ef4444" : "#6F6D6D"}
              strokeWidth={0.9}
            />
            {error && (
              <p
                className={cn(
                  "text-sm",
                  error ? "text-red-500" : "text-gray-700"
                )}
              >
                {error}
              </p>
            )}
          </>
        )}
      </div>
      {label && (
        <div className="border px-2 border-background-light bg-background py-0.5 w-fit rounded-xl mx-auto">
          <label className="text-sm font-medium">{label}</label>
        </div>
      )}
    </div>
  );
}
