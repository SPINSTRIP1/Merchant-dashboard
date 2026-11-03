import { Label } from "@/components/ui/label";
import ImagePicker from "@/components/image-picker";
import { useMenuForm } from "../../_context";

export default function Media() {
  const {
    form: { watch },
    handleFieldChange,
  } = useMenuForm();
  const files = watch("files") || [];
  const media = watch("images") || [];

  return (
    <div className="w-full space-y-3">
      <Label>Upload Menu Images</Label>
      <p className="text-xs text-muted-foreground">The first image is used as the thumbnail.</p>
      <ImagePicker
        value={files}
        onChange={(next) => handleFieldChange("files", next)}
        existing={media}
        onRemoveExisting={(index) =>
          handleFieldChange(
            "images",
            media.filter((_, i) => i !== index),
          )
        }
      />
    </div>
  );
}
