import GeneralInfo from "../steps/general-info";
import Pricing from "../steps/pricing";
import StockManagement from "../steps/stock-management";
import Visibility from "../steps/visibility";
import { useInventoryForm } from "../../_context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import StepProgress from "@/components/step-progress";
import { ActionType } from "@/app/(dashboard)/_types";

const STEPS = ["General Info", "Pricing", "Stock Management", "Visibility"];

export default function InventoryModal({
  isOpen,
  onClose,
  action = "add",
}: {
  isOpen: boolean;
  onClose: () => void;
  action?: ActionType;
}) {
  const { currentStep, handleNext, handlePrevious, loading } =
    useInventoryForm();
  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return <GeneralInfo />;
      case 2:
        return <Pricing />;
      case 3:
        return <StockManagement />;
      default:
        return <Visibility />;
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
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{action === "edit" ? "Edit Item" : "Add Item"}</SheetTitle>
          <SheetDescription>
            Step {currentStep} of {STEPS.length} — {STEPS[currentStep - 1]}
          </SheetDescription>
        </SheetHeader>
        <StepProgress steps={STEPS} currentStep={currentStep} />
        <div className="flex-1">{renderContent()}</div>
        <div className="flex items-center justify-between gap-3 border-t pt-4">
          <Button variant="outline" onClick={currentStep === 1 ? onClose : handlePrevious}>
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
