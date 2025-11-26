import GeneralInfo from "./steps/general-info";
import StepIndicator from "@/app/(dashboard)/settings/_components/step-indicator";
import { Button } from "@/components/ui/button";
import Pricing from "./steps/pricing";
import StockManagement from "./steps/stock-management";
import Visibility from "./steps/visibility";
import { useInventoryForm } from "../_context";

/**
 * @deprecated This component is deprecated and will be removed in a future version.
 * Please use the new inventory management system instead.
 */
export default function AddInventory() {
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

  return (
    <div className="space-y-7 pb-10 md:pb-0">
      <StepIndicator
        className="mb-16 mt-10 md:mt-0 justify-end items-end"
        currentStep={currentStep}
        steps={["General Info", "Pricing", "Stock Management", "Visibility"]}
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
          {loading ? "Submitting..." : currentStep === 4 ? "Submit" : "Next"}
        </Button>
      </div>
    </div>
  );
}
