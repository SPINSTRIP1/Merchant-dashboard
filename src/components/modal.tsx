import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;

  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, children, className }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={cn(
          "bg-white rounded-3xl p-3 lg:p-4 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto",
          className
        )}
      >
        {children}
        <Button
          className="w-full mt-3 max-w-52 mx-auto py-3 h-auto"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
  );
}
