import { X } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function SideModal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
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

  if (!isVisible) return null;

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 bg-black flex items-center justify-end z-50 transition-all duration-300 ease-in-out ${
        isAnimating ? "bg-opacity-50" : "bg-opacity-0"
      }`}
    >
      <div
        className={`bg-white relative rounded-l-3xl p-3 lg:p-4 shadow-xl max-w-[92vw] lg:max-w-[732px] w-full h-screen overflow-y-auto scrollbar-hide transition-transform duration-300 ease-in-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="p-1 absolute top-4 left-3 bg-neutral-accent rounded-full hover:bg-gray-200 transition-colors duration-200"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}
