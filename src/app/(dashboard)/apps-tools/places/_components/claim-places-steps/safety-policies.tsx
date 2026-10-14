import { Button } from "@/components/ui/button";
import React, { useCallback } from "react";
import { usePlacesForm } from "../../_context";
import { UploadFile } from "../upload-file";
import api from "@/lib/api/axios-client";
import { SERVER_URL } from "@/constants";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function SafetyPolicies() {
  const {
    form: { control, getValues },
    handleReset,
    setCurrentStep,
  } = usePlacesForm();
  const queryClient = useQueryClient();
  const [loading, setLoading] = React.useState(false);
  const submitPlace = useCallback(async () => {
    const {
      environmentalSafetyPolicy,
      privacyPolicy,
      disclaimers,
      ownershipDocument,
      ownershipVideo,

      id,
    } = getValues();

    setLoading(true);
    try {
      const formData = new FormData();

      if (environmentalSafetyPolicy instanceof File) {
        formData.append("environmentalSafetyPolicy", environmentalSafetyPolicy);
      }
      if (privacyPolicy instanceof File) {
        formData.append("privacyPolicy", privacyPolicy);
      }
      if (disclaimers instanceof File) {
        formData.append("disclaimers", disclaimers);
      }
      if (ownershipDocument instanceof File) {
        formData.append("ownershipDocument", ownershipDocument);
      }
      if (ownershipVideo instanceof File) {
        formData.append("ownershipVideo", ownershipVideo);
      }

      await api.post(SERVER_URL + `/places/${id}/claim`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Place claimed successfully!");
      queryClient.invalidateQueries({ queryKey: ["places"] });
      handleReset();
    } catch (error) {
      console.log("Error submitting Place:", error);
      toast.error(`Failed to claim place. Please try again.`);
    } finally {
      setLoading(false);
    }
  }, [getValues, queryClient, handleReset]);
  return (
    <div className="space-y-5">
      <UploadFile control={control} name="environmentalSafetyPolicy" label="Upload Environmental Safety Policy" />
      <UploadFile control={control} name="privacyPolicy" label="Upload Privacy Policy" />
      <UploadFile control={control} name="disclaimers" label="Upload Disclaimers" />
      <p className="text-xs text-muted-foreground">
        These documents are reviewed before ownership of the place is transferred to you.
      </p>

      <div className="flex justify-between gap-3 border-t pt-4">
        <Button variant="outline" onClick={() => setCurrentStep(2)}>
          Previous
        </Button>
        <Button variant="brand" onClick={submitPlace} disabled={loading}>
          {loading ? "Claiming..." : "Claim Place"}
        </Button>
      </div>
    </div>
  );
}
