import { Button } from "@/components/ui/button";
import React from "react";
import { usePlacesForm } from "../../_context";
import { FormArrayInput } from "@/components/ui/forms/form-array-input";
import { FormInput } from "@/components/ui/forms/form-input";

export default function GeneralInfo() {
  const {
    form: { control },
    setCurrentStep,
  } = usePlacesForm();
  return (
    <div className="space-y-5">
      <FormArrayInput
        control={control}
        name="emails"
        label="Contact Email"
        placeholder="Add Contact Email"
        type="email"
        description="Click on the + icon or press Enter to add an email."
      />

      <FormArrayInput
        control={control}
        name="phoneNumbers"
        label="Contact Phone Numbers"
        placeholder="Add Phone Number"
        type="tel"
        description="Click on the + icon or press Enter to add a phone number."
      />
      <FormInput control={control} label="Website (Optional)" name="website" placeholder="Enter Website URL" />

      <div className="flex justify-between gap-3 border-t pt-4">
        <Button variant="outline" onClick={() => setCurrentStep(1)}>
          Previous
        </Button>
        <Button variant="brand" onClick={() => setCurrentStep(3)}>
          Next
        </Button>
      </div>
    </div>
  );
}
