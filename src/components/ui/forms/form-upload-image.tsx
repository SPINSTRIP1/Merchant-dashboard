"use client";
import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  DragEvent,
  ChangeEvent,
  useEffect,
} from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DocumentAttachmentIcon,
  ImageAdd01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { Control, FieldValues, Path, useController } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

export type FileUploadType = "image" | "file";

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

interface FormUploadImageProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  type?: FileUploadType;
  className?: string;
  acceptedFormats?: string[];
  maxSizeInMB?: number;
  description?: string;
}

export function FormUploadImage<T extends FieldValues>({
  control,
  name,
  label,
  type = "image",
  className,
  acceptedFormats = type === "image"
    ? DEFAULT_IMAGE_FORMATS
    : DEFAULT_FILE_FORMATS,
  maxSizeInMB = 10,
  description,
}: FormUploadImageProps<T>) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string>("");
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

  // Sync image preview with field value
  useEffect(() => {
    if (isUrlString) {
      // If it's a URL, use it directly as preview
      setImagePreview(fieldValue as string);
    } else if (
      selectedFile &&
      type === "image" &&
      selectedFile.type?.startsWith("image/")
    ) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else if (!fieldValue) {
      setImagePreview(null);
    }
  }, [fieldValue, selectedFile, type, isUrlString]);

  // Memoized computations
  const acceptString = useMemo(() => {
    if (type === "image") return "image/*";

    return acceptedFormats
      .map(
        (format) =>
          FILE_TYPE_MAP[format.toUpperCase()] || `.${format.toLowerCase()}`,
      )
      .join(",");
  }, [type, acceptedFormats]);

  const maxSizeBytes = useMemo(() => maxSizeInMB * 1024 * 1024, [maxSizeInMB]);

  const acceptedFormatsUpperCase = useMemo(
    () => acceptedFormats.map((f) => f.toUpperCase()),
    [acceptedFormats],
  );

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxSizeBytes) {
        return `File size must be less than ${maxSizeInMB}MB`;
      }

      const fileExtension = file.name.split(".").pop()?.toUpperCase();
      if (fileExtension && !acceptedFormatsUpperCase.includes(fileExtension)) {
        return `File type not supported. Accepted formats: ${acceptedFormats.join(
          ", ",
        )}`;
      }

      return null;
    },
    [maxSizeBytes, maxSizeInMB, acceptedFormatsUpperCase, acceptedFormats],
  );

  const handleFileSelect = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setLocalError(validationError);
        field.onChange(null);
        setImagePreview(null);
        return;
      }

      setLocalError("");
      field.onChange(file);

      // Create image preview for image files
      if (type === "image" && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [validateFile, field, type],
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
    [handleFileSelect],
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
    [handleFileSelect],
  );

  const removeFile = useCallback(() => {
    field.onChange(null);
    setImagePreview(null);
    setLocalError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [field]);

  // Memoized icon selection
  const iconComponent = useMemo(
    () => (type === "image" ? ImageAdd01Icon : DocumentAttachmentIcon),
    [type],
  );

  // Memoized file size display
  const fileSizeDisplay = useMemo(() => {
    if (!selectedFile) return null;
    return `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`;
  }, [selectedFile]);

  // Check if we have any value (File or URL)
  const hasValue = !!fieldValue;

  const displayError = localError || error?.message;

  return (
    <div className="space-y-1.5 w-full">
      {label && <Label htmlFor={name}>{label}</Label>}
      <div
        className={cn(
          "rounded-2xl h-[169px] w-full bg-[#F3F3F3] border border-neutral-accent flex gap-y-2.5 flex-col items-center justify-center transition-all duration-200 cursor-pointer",
          isDragOver && "border-primary bg-primary-accent/20",
          displayError && "border-red-500 bg-red-50",
          hasValue && !displayError && "border-green-500 bg-green-50",
          className,
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

        {hasValue && !displayError ? (
          <div className="flex flex-col items-center gap-2 w-full h-full">
            {type === "image" && imagePreview ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt={selectedFile?.name || "Uploaded image"}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="size-6 flex items-center justify-center bg-red-500 absolute right-2 top-2 rounded-full"
                  type="button"
                >
                  <X size={15} className="text-white" />
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
                  {selectedFile?.name ||
                    (isUrlString ? "Image uploaded" : "File selected")}
                </p>
                <p className="text-xs text-green-600">
                  {fileSizeDisplay ||
                    (isUrlString ? "Click to replace" : "File selected")}
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
              color={displayError ? "#ef4444" : "#6F6D6D"}
              strokeWidth={0.9}
            />
          </>
        )}
      </div>

      {description && !displayError && (
        <div className="flex items-center justify-center flex-col pt-2">
          <p className="text-sm text-secondary-text">{description}</p>
          <span className="text-[9px] font-semibold text-gray-500">
            {acceptedFormats.join(", ")} formats supported (Max: {maxSizeInMB}
            MB)
          </span>
        </div>
      )}

      {displayError && (
        <p className="text-sm font-medium text-destructive">{displayError}</p>
      )}
    </div>
  );
}
