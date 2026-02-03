import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Copy02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React from "react";

export default function Account({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[400px]">
      <p className="text-center text-sm">Transfer the sum of N30,000.00 to</p>
      <div className="flex justify-center mt-4 mb-2 items-center gap-x-2">
        <h2 className="font-bold text-2xl text-primary-text">0021003201</h2>
        <HugeiconsIcon icon={Copy02Icon} size={24} color={"#6F6D6D"} />
      </div>
      <div className="flex justify-center mb-4 items-center gap-x-1">
        <div className="size-4 bg-neutral-accent rounded-full" />
        <p className="uppercase font-bold text-xxs text-center text-secondary-text">
          SPINSTRIP BANK
        </p>
      </div>
      <Button size={"lg"} className="w-full mt-4">
        I have paid
      </Button>
      <p className="uppercase text-xxs text-center mt-3 text-secondary-text">
        time left <span className="font-bold">00:04:59</span>
      </p>
    </Modal>
  );
}
