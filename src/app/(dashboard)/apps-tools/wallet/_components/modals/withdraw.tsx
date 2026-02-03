import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BankIcon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import React, { useCallback } from "react";

export default function Withdrawal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = React.useState<number>(1);
  const [pin, setPin] = React.useState<string[]>(["", "", "", ""]);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newPin = [...pin];
    newPin[index] = value.slice(-1); // Only take the last character
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirmPin = () => {
    const fullPin = pin.join("");
    if (fullPin.length === 4) {
      // Use the PIN here (e.g., send to API)
      console.log("PIN entered:", fullPin);
      setStep(3);
    }
  };

  const handleClose = useCallback(() => {
    setStep(1);
    setPin(["", "", "", ""]);
    onClose();
  }, [onClose]);

  const [amount, setAmount] = React.useState<number | null>(null);
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-[760px] flex flex-col items-center gap-y-1.5 justify-center"
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
          <p className="text-sm">Your withdrawal is been processed...</p>
        </>
      )}

      {step === 1 && (
        <>
          <h2 className="font-bold text-primary-text">Withdraw Funds</h2>

          <p className="text-sm">
            Funds will be withdrawn to your default settlement account
          </p>
          <h2 className="font-bold text-sm text-primary-text">
            Canton Cuisine 002*****1
          </h2>
          <div className="flex justify-center mb-4 items-center gap-x-1">
            <div className="size-4 bg-neutral-accent rounded-full" />
            <p className="uppercase font-bold text-xxs text-center text-secondary-text">
              SPINSTRIP BANK
            </p>
          </div>

          <div className="w-full space-y-2 mb-4">
            <Label>Amount</Label>
            <Input
              type="number"
              className="!rounded-2xl border border-neutral-accent"
              placeholder="Enter amount"
              value={amount !== null ? amount : ""}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>

          <Button
            onClick={() => setStep(2)}
            disabled={!amount || amount < 100}
            size={"lg"}
            className="w-full mt-2"
          >
            Confirm
          </Button>
        </>
      )}
      {step === 2 && (
        <>
          <h2 className="font-bold text-primary-text">
            Enter Transaction Passcode
          </h2>

          <div className="flex justify-center border-b pb-5 px-6 gap-3 my-4">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={pin[index]}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-3xl font-bold text-primary-text bg-neutral-accent rounded-xl focus:outline-none"
              />
            ))}
          </div>

          <div className="flex w-full items-center gap-x-4  mt-3">
            <Button
              size={"lg"}
              variant={"secondary"}
              className="w-full flex-1"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPin}
              disabled={pin.join("").length !== 4}
              size={"lg"}
              className="w-full flex-1"
            >
              Confirm
            </Button>
          </div>
          <div className="w-full">
            <button className="text-sm text-left text-secondary-text mt-2">
              Forgot Passcode?
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
