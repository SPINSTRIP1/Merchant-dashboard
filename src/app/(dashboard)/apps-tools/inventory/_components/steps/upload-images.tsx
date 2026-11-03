import { Label } from "@/components/ui/label";
import ImagePicker from "@/components/image-picker";
import { useInventoryForm } from "../../_context";
import api from "@/lib/api/axios-client";
import { SERVER_URL } from "@/constants";

export default function UploadImages() {
  const {
    form: { watch },
    handleFieldChange,
  } = useInventoryForm();
  const files = watch("files") || [];
  const media = watch("media") || [];

  const removeMediaImage = async (index: number) => {
    try {
      const id = watch("id");
      handleFieldChange(
        "media",
        media.filter((_, i) => i !== index),
      );
      await api.delete(SERVER_URL + `/inventory/products/${id}/images`, {
        data: { urls: [media[index]] },
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="space-y-3 w-full">
      <Label>Upload Item Images</Label>
      <p className="text-xs text-muted-foreground">The first image is used as the thumbnail.</p>
      <ImagePicker
        value={files}
        onChange={(next) => handleFieldChange("files", next)}
        existing={media}
        onRemoveExisting={removeMediaImage}
      />
    </div>
  );
}
