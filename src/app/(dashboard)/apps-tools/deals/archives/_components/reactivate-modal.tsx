import { Button } from "@/components/ui/button";
import Success from "@/components/ui/success";
import React, { useCallback, useEffect, useState } from "react";

export default function ReactivateModal({
  isOpen,
  title,
  onClose,
  onReactivate,
}: {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onReactivate: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const handleClose = useCallback(() => {
    setCurrentStep(1);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (currentStep === 2) {
      setTimeout(handleClose, 3000);
    }
  }, [currentStep, handleClose]);

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col gap-y-2 items-center justify-center">
            <Success type="info" />
            <h2 className="text-lg font-bold text-primary-text">{`Are you sure you want to reactivate ${title}?`}</h2>
            <p className="text-sm text-center">
              This deal will be reactivated and restored to your active deals
            </p>
            <div className="flex mt-4 gap-x-3 w-full items-center">
              <Button
                onClick={handleClose}
                variant={"secondary"}
                className="w-full h-[51px] py-3"
              >
                Close
              </Button>
              <Button
                className="w-full h-[51px] py-3"
                onClick={() => {
                  onReactivate();
                  setCurrentStep(2);
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col gap-y-2 items-center justify-center">
            <Success />
            <h2 className="text-lg font-bold text-primary-text">Successful</h2>
            <p className="text-sm text-center">{title} has been reactivated</p>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={
          "bg-foreground rounded-3xl p-3 lg:p-4 shadow-xl w-full max-h-[90vh] max-w-[760px] overflow-y-auto"
        }
      >
        {renderContent()}
      </div>
    </div>
  );
}
