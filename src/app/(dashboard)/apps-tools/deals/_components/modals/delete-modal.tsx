import { Button } from "@/components/ui/button";
import Success from "@/components/ui/success";
import React, { useEffect, useState } from "react";

interface DeleteModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  primaryText?: string;
  secondaryText?: string;
  onDeleteConfirm?: () => void;
  description?: string;
  headTitle?: string;
  successMessage?: string;
}

export default function DeleteModal({
  isOpen,
  title,
  onClose,
  primaryText = "Delete",
  secondaryText = "Deactivate Instead",
  onDeleteConfirm,
  description = "This deal will be deleted permanently and cannot be recovered",
  headTitle,
  successMessage,
}: Readonly<DeleteModalProps>) {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (currentStep === 2) {
      setTimeout(() => {
        setCurrentStep(1);
        onClose();
      }, 2000);
    }
  }, [currentStep, onClose]);

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col gap-y-2 items-center justify-center">
            <Success type="info" />
            <h2 className="text-lg font-bold text-primary-text">
              {headTitle || `Are you sure you want to delete ${title}?`}
            </h2>
            <p className="text-sm text-center">{description}</p>
            <div className="flex mt-4 gap-x-3 w-full items-center">
              <Button
                variant={"secondary"}
                onClick={onClose}
                className="w-full h-[51px] py-3"
              >
                {secondaryText}
              </Button>
              <Button
                className="w-full h-[51px] py-3"
                onClick={() => {
                  setCurrentStep(2);
                  if (onDeleteConfirm) {
                    onDeleteConfirm();
                  }
                }}
              >
                {primaryText}
              </Button>
            </div>
          </div>
        );
      // case 2:
      //   return (
      //     <div className="flex flex-col gap-y-2 items-center justify-center">
      //       <Success icon={LockPasswordIcon} />
      //       <h2 className="text-lg font-bold text-primary-text">
      //         Enter Password
      //       </h2>

      //       <div className="mt-4 w-full">
      //         <div className="space-y-1.5 px-4">
      //           <Label>Password</Label>
      //           <Input
      //             type="password"
      //             className="!rounded-2xl border border-neutral-accent"
      //             placeholder="Password"
      //           />
      //         </div>
      //         <Button
      //           className="w-full h-[51px] mt-5 py-3"
      //           onClick={() => setCurrentStep(3)}
      //         >
      //           Confirm
      //         </Button>
      //       </div>
      //     </div>
      //   );

      default:
        return (
          <div className="flex flex-col gap-y-2 items-center justify-center">
            <Success />
            <h2 className="text-lg font-bold text-primary-text">Successful</h2>
            <p className="text-sm text-center">
              {successMessage || `${title} has been deleted successfully.`}
            </p>
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
