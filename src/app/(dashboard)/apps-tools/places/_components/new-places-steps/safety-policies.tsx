import { usePlacesForm } from "../../_context";
import { UploadFile } from "../upload-file";

export default function SafetyPolicies() {
  const {
    form: { control },
  } = usePlacesForm();

  return (
    <div className="space-y-5">
      <UploadFile
        control={control}
        name="environmentalSafetyPolicy"
        label="Upload Environmental Safety Policy"
      />
      <UploadFile
        control={control}
        name="privacyPolicy"
        label="Upload Privacy Policy"
      />
      <UploadFile
        control={control}
        name="disclaimers"
        label="Upload Disclaimers"
      />
      <p className="rounded-xl bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
        These documents are reviewed before your place is published on SpinStrip Discover.
      </p>
    </div>
  );
}
