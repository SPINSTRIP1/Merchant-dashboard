import { cn } from "@/lib/utils";
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, children, className }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[#00000099] backdrop-blur flex items-center justify-center z-50 p-4"
    >
      <div
        className={cn(
          "bg-[#F8F8F8] rounded-3xl p-3 lg:p-4 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
