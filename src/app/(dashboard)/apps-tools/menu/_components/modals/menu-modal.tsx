import GeneralInfo from "../steps/general-info";
import { useMenuForm } from "../../_context";
import { ActionType } from "@/app/(dashboard)/_types";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import StepProgress from "@/components/step-progress";
import Media from "../steps/media";
import Configuration from "../steps/configuration";
import DealSettings from "../steps/deal-settings";

export default function MenuModal({
  isOpen,
  onClose,
  action = "add",
}: {
  isOpen: boolean;
  onClose: () => void;
  action?: ActionType;
}) {
  const { currentStep, handleNext, handlePrevious, loading, steps } = useMenuForm();
  const isEditing = action === "edit";

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

  const isLastStep = currentStep === steps.length;
  const nextLabel = loading
    ? isEditing
      ? "Saving…"
      : "Submitting…"
    : isLastStep
      ? isEditing
        ? "Save Changes"
        : "Submit"
      : "Next";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Menu Item" : "Add Menu"}</SheetTitle>
          <SheetDescription>
            Step {currentStep} of {steps.length} — {steps[currentStep - 1]}
          </SheetDescription>
        </SheetHeader>
        <StepProgress steps={steps} currentStep={currentStep} />

        <div className="flex-1 pb-2">{renderContent()}</div>

        <div className="flex items-center justify-between gap-3 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 1 ? onClose : handlePrevious}
          >
            {currentStep === 1 ? "Cancel" : "Previous"}
          </Button>
          <Button type="button" variant="brand" onClick={handleNext} disabled={loading}>
            {nextLabel}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
