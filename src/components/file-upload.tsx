"use client";
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  DragEvent,
  ChangeEvent,
} from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ImageUpload01Icon,
  DocumentAttachmentIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import api from "@/lib/api/axios-client";
import toast from "react-hot-toast";
import { SERVER_URL } from "@/constants";

export type FileUploadType = "image" | "file";

interface FileUploadProps {
  type?: FileUploadType;
  className?: string;
  onFileSelect?: (fileKey: string | null) => void;
  acceptedFormats?: string[];
  maxSizeInMB?: number;
  label?: string;
  placeholder?: string;
  value?: string | null;
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

export default function FileUpload({
  type = "image",
  className,
  onFileSelect,
  acceptedFormats = type === "image"
    ? DEFAULT_IMAGE_FORMATS
    : DEFAULT_FILE_FORMATS,
  maxSizeInMB = 10,
  label,
  placeholder = type === "image"
    ? "Click to upload logo or drop image here"
    : "Click to upload document or drop file here",
  value = null,
  fileName,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileData, setUploadedFileData] = useState<{
    name: string;
    key: string;
  } | null>(null);
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

  // Sync internal state with value prop
  useEffect(() => {
    if (value) {
      setError("");
      setUploadedFileData({
        name: `Uploaded file (${fileName})`,
        key: value,
      });
    } else {
      setUploadedFileData(null);
    }
  }, [value, fileName]);

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

  const uploadFileToServer = useCallback(
    async (file: File): Promise<{ name: string; key: string }[] | null> => {
      try {
        const formData = new FormData();
        formData.append(fileName, file);

        const response = await api.post(
          `${SERVER_URL}/kyc/upload/merchant`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        return response.data.data;
      } catch (error) {
        console.error("File upload failed:", error);
        toast.error("Failed to upload file. Please try again.");
        return null;
      }
    },
    [fileName]
  );

  const handleFileSelect = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
        setUploadedFileData(null);
        onFileSelect?.(null);
        return;
      }

      setError("");
      setSelectedFile(file);
      setIsUploading(true);

      try {
        const uploadResult = await uploadFileToServer(file);

        if (uploadResult?.[0]) {
          setUploadedFileData(uploadResult[0]);
          onFileSelect?.(uploadResult[0].key);
        } else {
          throw new Error("Upload failed");
        }
      } catch {
        setSelectedFile(null);
        setUploadedFileData(null);
        onFileSelect?.(null);
      } finally {
        setIsUploading(false);
      }
    },
    [validateFile, uploadFileToServer, onFileSelect]
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
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  }, [isUploading]);

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
    setUploadedFileData(null);
    setError("");
    onFileSelect?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onFileSelect]);

  // Memoized icon selection
  const iconComponent = useMemo(
    () => (type === "image" ? ImageUpload01Icon : DocumentAttachmentIcon),
    [type]
  );

  // Memoized file size display
  const fileSizeDisplay = useMemo(() => {
    if (!selectedFile) return null;
    return `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`;
  }, [selectedFile]);

  return (
    <div className="space-y-2.5">
      {label && <label className="text-sm font-medium">{label}</label>}

      <div
        className={cn(
          "rounded-2xl h-[169px] bg-[#F3F3F3] border border-neutral-accent flex gap-y-2.5 flex-col items-center justify-center transition-all duration-200",
          !isUploading && "cursor-pointer",
          isDragOver && !isUploading && "border-primary bg-primary-accent/20",
          error && "border-red-500 bg-red-50",
          uploadedFileData && "border-green-500 bg-green-50",
          isUploading && "cursor-not-allowed opacity-75",
          className
        )}
        onDragOver={isUploading ? undefined : handleDragOver}
        onDragLeave={isUploading ? undefined : handleDragLeave}
        onDrop={isUploading ? undefined : handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptString}
          onChange={handleInputChange}
          disabled={isUploading}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-sm font-medium text-primary">
              Uploading file...
            </p>
            {selectedFile && (
              <p className="text-xs text-gray-600">
                {selectedFile.name} ({fileSizeDisplay})
              </p>
            )}
          </div>
        ) : uploadedFileData ? (
          <div className="flex flex-col items-center gap-2">
            <HugeiconsIcon
              icon={iconComponent}
              size={48}
              color="#22c55e"
              strokeWidth={0.9}
            />
            <p className="text-sm font-medium text-green-700">
              {uploadedFileData.name}
            </p>
            <p className="text-xs text-green-600">
              {fileSizeDisplay || "File uploaded"}
            </p>
            <p className="text-xs text-gray-500">File uploaded successfully</p>
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
          </div>
        ) : (
          <>
            <HugeiconsIcon
              icon={iconComponent}
              size={48}
              color={error ? "#ef4444" : "#6F6D6D"}
              strokeWidth={0.9}
            />
            <p
              className={cn(
                "text-sm",
                error ? "text-red-500" : "text-gray-700"
              )}
            >
              {error || placeholder}
            </p>
            <span className="text-[9px] font-semibold text-gray-500">
              {acceptedFormats.join(", ")} formats supported (Max {maxSizeInMB}
              MB)
            </span>
          </>
        )}
      </div>
    </div>
  );
}
