import GeneralInfo from "../steps/general-info";
import { ActionType, useMenuForm } from "../../_context";
import { Button } from "@/components/ui/button";
import StepIndicator from "@/app/(dashboard)/settings/_components/step-indicator";
import Media from "../steps/media";
import Configuration from "../steps/configuration";
import DealSettings from "../steps/deal-settings";
import SideModal from "@/app/(dashboard)/_components/side-modal";

export default function MenuModal({
  isOpen,
  onClose,
  action = "add",
}: {
  isOpen: boolean;
  onClose: () => void;
  action?: ActionType;
}) {
  const { currentStep, handleNext, handlePrevious, loading, steps } =
    useMenuForm();
  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return <GeneralInfo />;
      case 2:
        return <Media />;
      case 3:
        return <Configuration />;
      default:
        return <DealSettings />;
    }
  };

  const getButtonLabel = () => {
    if (loading) {
      return action === "edit" ? "Updating..." : "Submitting...";
    }
    if (currentStep === 4) {
      return action === "edit" ? "Update" : "Submit";
    }
    return "Next";
  };

  return (
    <SideModal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-7 pb-10 md:pb-0">
        <StepIndicator
          className="mb-16 mt-10 md:mt-0 justify-end items-end"
          currentStep={currentStep}
          steps={steps}
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
