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
  className?: string;
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
      className={`fixed inset-0 z-50 flex items-center justify-end backdrop-blur-[2px] transition-colors duration-300 ease-in-out ${
        isAnimating ? "bg-black/50" : "bg-black/0"
      }`}
    >
      <div
        className={`relative h-screen w-full max-w-[92vw] overflow-y-auto rounded-l-3xl border-l bg-card p-4 text-card-foreground shadow-xl scrollbar-hide lg:max-w-[732px] lg:p-6 transition-transform duration-300 ease-in-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute left-3 top-4 grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X size={18} />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  );
}
