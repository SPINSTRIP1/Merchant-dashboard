import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { useMenuForm } from "../../_context";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import UploadFile from "@/app/(dashboard)/_components/upload-file";

export default function Media() {
  const {
    form: { watch },
    handleFieldChange,
  } = useMenuForm();
  const [imageUploadFields, setImageUploadFields] = useState([0]); // Start with one field
  const files = watch("files") || [];
  const media = watch("images") || [];

  const handleFileSelect = (file: File | null, index: number) => {
    if (!file) return;

    const currentFiles = [...files];
    currentFiles[index] = file;
    handleFieldChange("files", currentFiles);
  };

  const addImageUploadField = () => {
    setImageUploadFields([...imageUploadFields, imageUploadFields.length]);
  };

  const removeImageUploadField = (index: number) => {
    // Remove the field
    const newFields = imageUploadFields.filter((_, i) => i !== index);
    setImageUploadFields(newFields);

    // Remove the file at that index
    const currentFiles = [...files];
    currentFiles.splice(index, 1);
    handleFieldChange("files", currentFiles);
  };

  const removeMediaImage = (index: number) => {
    const currentMedia = [...media];
    currentMedia.splice(index, 1);
    handleFieldChange("images", currentMedia);
  };

  return (
    <div className="w-full space-y-3">
      <Label>Upload Menu Images</Label>
      <p className="text-xs text-muted-foreground">
        The first image is used as the thumbnail. JPG, JPEG, PNG or WEBP, up to 10MB each.
      </p>

      {/* Display existing media images from server */}
      {
        <div className="flex gap-4 flex-wrap mb-4">
          {media.length > 0 &&
            media.map((imageUrl, index) => (
              <div
                key={`media-${index}`}
                className="relative w-[158px] h-[169px]"
              >
                <Image
                  src={imageUrl}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="rounded-2xl border object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeMediaImage(index)}
                  aria-label="Remove image"
                  className="absolute right-1.5 top-1.5 z-10 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          {imageUploadFields.map((fieldId, index) => (
            <div key={fieldId} className="relative w-full max-w-[158px]">
              <UploadFile
                label={index === 0 ? "Thumbnail" : `Image ${index + 1}`}
                onFileSelect={(file) => handleFileSelect(file, index)}
                value={files[index]}
              />
              {imageUploadFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageUploadField(index)}
                  aria-label="Remove image slot"
                  className="absolute right-1.5 top-1.5 z-10 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      }

      {/* Add more images button */}
      {imageUploadFields.length < 6 && (
        <div className="flex justify-center mt-4">
          <Button
            type="button"
            onClick={addImageUploadField}
            variant="soft"
            size="sm"
          >
            <Plus />
            Add Another Image
          </Button>
        </div>
      )}
    </div>
  );
}
