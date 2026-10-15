import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import StepProgress from "@/components/step-progress";
import { usePlacesForm } from "../../_context";
import GeneralInfo from "../new-places-steps/general-info";
import OperatingHours from "../new-places-steps/operating-hours";
import SafetyPolicies from "../new-places-steps/safety-policies";
import LocationVerification from "../new-places-steps/location-verification";
import { Button } from "@/components/ui/button";
import { ActionType } from "@/app/(dashboard)/_types";
import { FormProvider } from "react-hook-form";

const STEPS = ["General Info", "Operating Hours", "Safety & Policies", "Location Verification"];

export default function CreatePlacesModal({
  isOpen,
  onClose,
  action = "add",
}: {
  isOpen: boolean;
  onClose: () => void;
  action?: ActionType;
}) {
  const { currentStep, form, handleNext, handlePrevious, loading } = usePlacesForm();
  const isEditing = action === "edit";

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return <GeneralInfo />;
      case 2:
        return <OperatingHours />;
      case 3:
        return <SafetyPolicies />;
      case 4:
        return <LocationVerification />;
      default:
        return null;
    }
  };
  const getButtonLabel = () => {
    if (loading) {
      return isEditing ? "Updating..." : "Publishing...";
    }
    if (currentStep === 4) {
      return isEditing ? "Update" : "Publish";
    }
    return "Next";
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{isEditing ? `Edit ${form.watch("name") || "Place"}` : "Add Place"}</SheetTitle>
          <SheetDescription>
            Step {currentStep} of {STEPS.length} — {STEPS[currentStep - 1]}
          </SheetDescription>
        </SheetHeader>
        <StepProgress steps={STEPS} currentStep={currentStep} />
        <FormProvider {...form}>
          <div className="flex-1">{renderContent()}</div>
        </FormProvider>
        <div className="flex items-center justify-between gap-3 border-t pt-4">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onClose : handlePrevious}
          >
            {currentStep === 1 ? "Cancel" : "Previous"}
          </Button>
          <Button variant="brand" onClick={handleNext} disabled={loading}>
            {getButtonLabel()}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
