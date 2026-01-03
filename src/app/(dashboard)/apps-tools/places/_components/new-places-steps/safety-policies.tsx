import { usePlacesForm } from "../../_context";
import { UploadFile } from "../upload-file";

export default function SafetyPolicies() {
  const {
    form: { control },
  } = usePlacesForm();

  return (
    <div className="space-y-7 py-5">
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
    </div>
  );
}
