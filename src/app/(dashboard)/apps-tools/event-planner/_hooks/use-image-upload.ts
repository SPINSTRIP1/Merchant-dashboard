import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { useCallback, useRef, useEffect } from "react";

/** Removes an already-uploaded event image, locally and on the server. */
export const useImageUpload = (
  media: string[],
  handleFieldChange: (name: string, value: unknown) => void,
) => {
  // Ref keeps the latest list without re-creating the callback.
  const mediaRef = useRef(media);

  useEffect(() => {
    mediaRef.current = media;
  }, [media]);

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

  return { removeMediaImage };
};
