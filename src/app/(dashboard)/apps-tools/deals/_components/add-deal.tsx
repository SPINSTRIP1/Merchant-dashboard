import React from "react";
import StepIndicator from "@/app/(dashboard)/settings/_components/step-indicator";
import { Button } from "@/components/ui/button";
import CreateCategory from "./steps/create-category";
import Media from "./steps/media";
import Configuration from "./steps/configuration";
import DealSettings from "./steps/deal-settings";

export default function AddInventory() {
  const [currentStep, setCurrentStep] = React.useState(1);
  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return <CreateCategory />;
      case 2:
        return <Media />;
      case 3:
        return <Configuration />;
      default:
        return <DealSettings />;
    }
  };

  return (
    <div className="space-y-7 pb-10 md:pb-0">
      <StepIndicator
        className="mb-16 mt-10 md:mt-0 justify-end items-end"
        currentStep={currentStep}
        steps={["Create a Category", "Media", "Configuration", "Deal Settings"]}
      />
      {renderContent()}
      <div className="flex items-center justify-center">
        <Button
          onClick={() => setCurrentStep((prev) => Math.min(prev + 1, 4))}
          className="w-[368px] h-[51px]"
        >
          {currentStep === 4 ? "Submit" : "Next"}
        </Button>
      </div>
    </div>
  );
}
