import { X } from "lucide-react";
import UploadFile from "@/app/(dashboard)/_components/upload-file";

export interface ImageUploadFieldProps {
  fieldId: number;
  index: number;
  file: File | undefined;
  canRemove: boolean;
  onFileSelect: (file: File | null, index: number) => void;
  onRemove: (index: number) => void;
}

export const ImageUploadField = ({
  index,
  file,
  canRemove,
  onFileSelect,
  onRemove,
}: ImageUploadFieldProps) => (
  <div className="relative w-full max-w-[158px]">
    <UploadFile
      label={index === 0 ? "Thumbnail" : `Image ${index + 1}`}
      onFileSelect={(f) => onFileSelect(f, index)}
      value={file}
    />
    {canRemove && (
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
      >
        <X size={16} />
      </button>
    )}
  </div>
);
