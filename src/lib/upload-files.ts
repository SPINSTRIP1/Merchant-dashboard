import api from "@/lib/api/axios-client";
import toast from "react-hot-toast";

interface UploadFilesOptions {
  files: File[];
  endpoint: string;
  entityName: string;
  isUpdating?: boolean;
  fieldName?: string;
}

interface UploadNamedFilesOptions {
  files: Record<string, File | undefined>;
  endpoint: string;
  entityName: string;
  isUpdating?: boolean;
}

/**
 * Upload multiple files to an endpoint (e.g., product images, menu images)
 * Used when uploading an array of files to a single field
 */
export async function uploadFiles({
  files,
  endpoint,
  entityName,
  isUpdating = false,
  fieldName = "files",
}: UploadFilesOptions): Promise<boolean> {
  if (!files?.length) return true;

  try {
    const formData = new FormData();
    files.forEach((file) => formData.append(fieldName, file));

    await api.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return true;
  } catch (error) {
    console.log("Error uploading files:", error);
    toast.error(
      `${entityName} ${
        isUpdating ? "updated" : "created"
      } but failed to upload images. Please try again.`,
    );
    return false;
  }
}

/**
 * Upload multiple named files to an endpoint (e.g., coverImage, policy documents)
 * Used when uploading different files to different fields
 */
export async function uploadNamedFiles({
  files,
  endpoint,
  entityName,
  isUpdating = false,
}: UploadNamedFilesOptions): Promise<boolean> {
  const formData = new FormData();
  let hasFiles = false;

  Object.entries(files).forEach(([key, file]) => {
    if (file instanceof File) {
      formData.append(key, file);
      hasFiles = true;
    }
  });

  if (!hasFiles) return true;

  try {
    await api.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return true;
  } catch (error) {
    console.log("Error uploading files:", error);
    toast.error(
      `${entityName} ${
        isUpdating ? "updated" : "created"
      } but failed to upload files. Please try again.`,
    );
    return false;
  }
}
