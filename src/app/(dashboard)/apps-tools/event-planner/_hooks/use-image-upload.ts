import { EVENTS_SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { useCallback, useState } from "react";

export const useImageUpload = (
  files: File[],
  media: string[],
  handleFieldChange: (name: string, value: unknown) => void
) => {
  const [imageUploadFields, setImageUploadFields] = useState([0]);

  const handleFileSelect = useCallback(
    (file: File | null, index: number) => {
      if (!file) return;
      const currentFiles = [...files];
      currentFiles[index] = file;
      handleFieldChange("files", currentFiles);
    },
    [files, handleFieldChange]
  );

  const addImageUploadField = useCallback(() => {
    setImageUploadFields((prev) => [...prev, prev.length]);
  }, []);

  const removeImageUploadField = useCallback(
    (index: number) => {
      setImageUploadFields((prev) => prev.filter((_, i) => i !== index));
      const currentFiles = [...files];
      currentFiles.splice(index, 1);
      handleFieldChange("files", currentFiles);
    },
    [files, handleFieldChange]
  );

  const removeMediaImage = useCallback(
    async (index: number, id: string) => {
      const currentMedia = [...media];
      currentMedia.splice(index, 1);
      handleFieldChange("images", currentMedia);
      await api.delete(`${EVENTS_SERVER_URL}/events/${id}/media`, {
        data: { urls: [media[index]] },
      });
    },
    [media, handleFieldChange]
  );

  const resetFields = useCallback(() => {
    setImageUploadFields([0]);
  }, []);

  return {
    imageUploadFields,
    handleFileSelect,
    addImageUploadField,
    removeImageUploadField,
    removeMediaImage,
    resetFields,
  };
};
