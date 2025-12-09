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
    <div className="space-y-3 w-full">
      <Label>Upload Menu Images</Label>

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
                  className="object-cover rounded-2xl border border-neutral-accent"
                />
                <button
                  type="button"
                  onClick={() => removeMediaImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          {imageUploadFields.map((fieldId, index) => (
            <div key={fieldId} className="relative w-full max-w-[158px]">
              <UploadFile
                fileName={`image-${index}`}
                label={index === 0 ? "Thumbnail" : `Image ${index + 1}`}
                onFileSelect={(file) => handleFileSelect(file, index)}
                value={files[index]}
              />
              {imageUploadFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageUploadField(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      }

      <div className="flex items-center justify-center flex-col pt-2">
        <p className="text-sm text-gray-600">
          Click to upload or drag and drop images
        </p>
        <span className="text-[9px] font-semibold text-gray-500">
          JPG, JPEG, PNG, WEBP formats supported (Max 10MB per image)
        </span>
      </div>
      {/* Add more images button */}
      {imageUploadFields.length < 6 && (
        <div className="flex justify-center mt-4">
          <Button
            type="button"
            onClick={addImageUploadField}
            variant="secondary"
            className="md:w-auto"
          >
            <Plus className="mr-2" size={18} />
            Add Another Image
          </Button>
        </div>
      )}
    </div>
  );
}
