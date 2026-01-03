import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: (e: "claim" | "new" | null) => void;
}

export default function SelectModal({
  isOpen,
  onClose,
}: Readonly<DeleteModalProps>) {
  const [selectedOption, setSelectedOption] = useState<"claim" | "new" | null>(
    null
  );
  useEffect(() => {
    if (selectedOption) {
      onClose(selectedOption);
      setSelectedOption(null);
    }
  }, [selectedOption, onClose]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={
          "bg-foreground rounded-3xl p-3 lg:p-4 shadow-xl w-full max-h-[90vh] max-w-[760px] overflow-y-auto"
        }
      >
        <h1 className="text-center text-lg  font-bold text-primary-text">
          Choose how you want to publish your place
        </h1>

        <div
          style={{
            backgroundImage: "url('/places/publish-bg.png')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "140%",
          }}
          onClick={() => setSelectedOption("new")}
          className={cn(
            "cursor-pointer flex items-center h-[240px] bg-center justify-between rounded-2xl p-6 mt-6 gap-x-4",
            selectedOption === "new" && "border border-primary"
          )}
        >
          <div>
            <h2 className="font-bold text-primary-text">New Place</h2>
            <p className="text-sm">For Places not already on SpinStrip</p>
          </div>
          <Image
            src={"/places/new-place.svg"}
            width={400}
            height={400}
            alt="new place"
            className="w-[173px] h-[155px] object-cover"
          />
        </div>
        <div
          style={{
            backgroundImage: "url('/places/publish-bg.png')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "140%",
          }}
          onClick={() => setSelectedOption("claim")}
          className={cn(
            "cursor-pointer flex items-center h-[240px] bg-center justify-between rounded-2xl p-6 mt-6 gap-x-4",
            selectedOption === "claim" && "border border-primary"
          )}
        >
          <div>
            <h2 className="font-bold text-primary-text">Claim Place</h2>
            <p className="text-sm">For Places already existing on SpinStrip</p>
          </div>
          <Image
            src={"/places/claim-place.svg"}
            width={400}
            height={400}
            alt="claim place"
            className="w-[235px] h-[129px] object-cover"
          />
        </div>
      </div>
    </div>
  );
}
