import Success from "@/components/ui/success";
import React, { useEffect } from "react";

export default function SuccessModal({
  isOpen,
  description,
  onClose,
}: {
  isOpen: boolean;
  description: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => onClose(), 1500);
    }
  }, [isOpen]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={
          "bg-foreground rounded-3xl p-3 lg:p-4 shadow-xl w-full max-h-[90vh] max-w-[760px] overflow-y-auto"
        }
      >
        <div className="flex flex-col gap-y-2 items-center justify-center">
          <Success />
          <h2 className="text-lg font-bold text-primary-text">Successful</h2>
          <p className="text-sm text-center">{description}</p>
        </div>
      </div>
    </div>
  );
}
