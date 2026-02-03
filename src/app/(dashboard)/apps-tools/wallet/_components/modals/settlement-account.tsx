import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BankIcon,
  CheckmarkCircle01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import React, { useCallback } from "react";

export default function SettlementAccount({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = React.useState<number>(1);

  const handleClose = useCallback(() => {
    setStep(1);
    onClose();
  }, [onClose]);
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-[760px] flex flex-col items-center justify-center"
    >
      <div className="bg-white relative overflow-hidden p-3 mb-2 rounded-full shadow-md">
        <HugeiconsIcon
          icon={step === 3 ? CheckmarkCircle01Icon : BankIcon}
          size={24}
          color={"#6932E2"}
          className="z-[999]"
        />
        <Image
          src={"/icons/check.svg"}
          className="size-[36px] absolute opacity-60 -bottom-3 z-10 -left-3"
          width={40}
          height={40}
          alt="check"
        />
      </div>
      {step === 3 && (
        <>
          <h2 className="font-bold text-primary-text">Successful</h2>
          <p className="text-sm">Your Settlement Account has been updated</p>
        </>
      )}

      {step === 1 && (
        <>
          <h2 className="font-bold text-primary-text">
            Add Settlement Account
          </h2>
          <form action="" className="w-full space-y-5">
            <div className="w-full space-y-2">
              <Label>Account Number</Label>
              <Input
                className="!rounded-2xl border border-neutral-accent"
                placeholder="Enter account number"
              />
            </div>
            <div className="w-full space-y-2">
              <Label>Account Name</Label>
              <Input
                className="!rounded-2xl border border-neutral-accent"
                placeholder="Enter account name"
              />
            </div>{" "}
            <div className="w-full space-y-2">
              <Label>Bank</Label>
              <Input
                className="!rounded-2xl border border-neutral-accent"
                placeholder="Enter bank name"
              />
            </div>
            <button className="flex items-center gap-x-1 mt-5 border border-neutral-accent px-1.5 rounded-3xl py-0.5">
              <HugeiconsIcon icon={PlusSignIcon} size={14} color={"#6F6D6D"} />
              <p>Add Alternative Account</p>
            </button>
          </form>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="font-bold text-primary-text">Enter Password</h2>

          <div className="w-full space-y-2">
            <Label>Password</Label>
            <Input
              className="!rounded-2xl border border-neutral-accent"
              placeholder="Enter account number"
            />
          </div>
        </>
      )}
      {step !== 3 && (
        <Button
          size={"lg"}
          onClick={() => setStep((prev) => Math.min(prev + 1, 3))}
          className="w-full mt-4"
        >
          Confirm
        </Button>
      )}
    </Modal>
  );
}
