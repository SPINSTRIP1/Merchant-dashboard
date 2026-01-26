import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { useCallback, useState, useRef, useEffect } from "react";

export const useImageUpload = (
  files: File[],
  media: string[],
  handleFieldChange: (name: string, value: unknown) => void,
) => {
  const [imageUploadFields, setImageUploadFields] = useState([0]);

  // Use refs to always have the latest values without causing re-renders
  const filesRef = useRef(files);
  const mediaRef = useRef(media);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    mediaRef.current = media;
  }, [media]);

  const handleFileSelect = useCallback(
    (file: File | null, index: number) => {
      if (!file) return;
      const currentFiles = [...filesRef.current];
      currentFiles[index] = file;
      handleFieldChange("files", currentFiles);
    },
    [handleFieldChange],
  );

  const addImageUploadField = useCallback(() => {
    setImageUploadFields((prev) => [...prev, prev.length]);
  }, []);

  const removeImageUploadField = useCallback(
    (index: number) => {
      setImageUploadFields((prev) => prev.filter((_, i) => i !== index));
      const currentFiles = [...filesRef.current];
      currentFiles.splice(index, 1);
      handleFieldChange("files", currentFiles);
    },
    [handleFieldChange],
  );

  const removeMediaImage = useCallback(
    async (index: number, id: string) => {
      const currentMedia = [...mediaRef.current];
      const urlToDelete = currentMedia[index];
      currentMedia.splice(index, 1);
      handleFieldChange("images", currentMedia);
      await api.delete(`${SERVER_URL}/events/${id}/media`, {
        data: { urls: [urlToDelete] },
      });
    },
    [handleFieldChange],
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
