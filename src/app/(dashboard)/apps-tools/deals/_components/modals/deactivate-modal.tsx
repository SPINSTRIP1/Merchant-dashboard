import { Button } from "@/components/ui/button";
import Success from "@/components/ui/success";
import React, { useCallback, useEffect, useState } from "react";

export default function DeactivateModal({
  isOpen,
  title,
  onClose,
  onDeactivate,
}: {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onDeactivate: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const handleClose = useCallback(() => {
    setCurrentStep(1);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (currentStep === 2) {
      setTimeout(handleClose, 2000);
    }
  }, [currentStep, handleClose]);

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col gap-y-2 items-center justify-center">
            <Success type="info" />
            <h2 className="text-lg font-bold text-primary-text">{`Are you sure you want to Deactivate ${title}?`}</h2>
            <p className="text-sm text-center">
              This deal will be deactivated and can be found in Archives
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
                  onDeactivate();
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
            <p className="text-sm text-center">{title} has been deactivated</p>
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
