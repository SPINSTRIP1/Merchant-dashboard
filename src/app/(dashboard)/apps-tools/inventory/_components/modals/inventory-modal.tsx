import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import GeneralInfo from "../steps/general-info";
import Pricing from "../steps/pricing";
import StockManagement from "../steps/stock-management";
import Visibility from "../steps/visibility";
import { ActionType, useInventoryForm } from "../../_context";
import { Button } from "@/components/ui/button";
import StepIndicator from "@/app/(dashboard)/settings/_components/step-indicator";

export default function InventoryModal({
  isOpen,
  onClose,
  action = "add",
}: {
  isOpen: boolean;
  onClose: () => void;
  action?: ActionType;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Trigger animation after the modal is visible
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Hide modal after animation completes
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };
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
  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 bg-black flex items-center justify-end z-50 transition-all duration-300 ease-in-out ${
        isAnimating ? "bg-opacity-50" : "bg-opacity-0"
      }`}
    >
      <div
        className={`bg-white relative rounded-l-3xl p-3 lg:p-4 shadow-xl max-w-[92vw] lg:max-w-[732px] w-full h-screen overflow-y-auto scrollbar-hide transition-transform duration-300 ease-in-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          onClick={handleClose}
          className="p-1 absolute top-4 left-3 bg-neutral-accent rounded-full hover:bg-gray-200 transition-colors duration-200"
        >
          <X size={20} />
        </button>
        <div className="space-y-7 pb-10 md:pb-0">
          <StepIndicator
            className="mb-16 mt-10 md:mt-0 justify-end items-end"
            currentStep={currentStep}
            steps={[
              "General Info",
              "Pricing",
              "Stock Management",
              "Visibility",
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
      </div>
    </div>
  );
}
