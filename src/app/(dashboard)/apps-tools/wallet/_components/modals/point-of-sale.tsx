import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { useReduxAuth } from "@/hooks/use-redux-auth";
import Image from "next/image";
import React from "react";

export default function PointOfSale({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user } = useReduxAuth();
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[400px]">
      <div className="flex border border-[#E0E0E0] py-4 rounded-xl items-center justify-center flex-col">
        <div className="flex items-center gap-x-2">
          <Image
            src={user?.avatarUrl || "/avatar.jpg"}
            width={150}
            height={150}
            alt="Point of Sale"
            className="size-6 rounded-full"
          />
          <p className="text-sm text-primary-text">{user?.fullName}</p>
        </div>
        <p className="font-bold text-primary-text mt-3">
          Point of Sale QR Code
        </p>
      </div>
      <Image
        src={"/qrcode.png"}
        width={150}
        height={150}
        alt="Point of Sale"
        className="size-[200px] mx-auto my-6"
      />
      <Button size={"lg"} className="w-full mt-5">
        Print QR Code
      </Button>
      <Button size={"lg"} variant={"secondary"} className="w-full mt-4">
        Share QR Code
      </Button>
    </Modal>
  );
}
