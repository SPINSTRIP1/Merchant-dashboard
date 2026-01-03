import StepIndicator from "@/app/(dashboard)/settings/_components/step-indicator";
import SideModal from "@/app/(dashboard)/_components/side-modal";
import { usePlacesForm } from "../../_context";
import GeneralInfo from "../new-places-steps/general-info";
import OperatingHours from "../new-places-steps/operating-hours";
import SafetyPolicies from "../new-places-steps/safety-policies";
import LocationVerification from "../new-places-steps/location-verification";
import { Button } from "@/components/ui/button";
import { ActionType } from "@/app/(dashboard)/_types";

export default function CreatePlacesModal({
  isOpen,
  onClose,
  action = "add",
}: {
  isOpen: boolean;
  onClose: () => void;
  action?: ActionType;
}) {
  const {
    currentStep,

    handleNext,
    handlePrevious,
    loading,
  } = usePlacesForm();
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
      return action === "edit" ? "Updating..." : "Publishing...";
    }
    if (currentStep === 4) {
      return action === "edit" ? "Update" : "Publish";
    }
    return "Next";
  };

  return (
    <SideModal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-7 pb-10 md:pb-0">
        <StepIndicator
          className="mb-16 mt-10 md:mt-0 pr-5 justify-end items-end"
          currentStep={currentStep}
          steps={[
            "General Info",
            "Operating Hours",
            "Safety & Policies",
            "Location Verification",
          ]}
        />
        {renderContent()}
        <div className="flex gap-x-2 w-full items-center justify-center">
          <Button
            onClick={handlePrevious}
            className="w-full"
            size={"lg"}
            variant={"secondary"}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={loading}
            className="w-full"
            size={"lg"}
          >
            {getButtonLabel()}
          </Button>
        </div>
      </div>
    </SideModal>
  );
}
