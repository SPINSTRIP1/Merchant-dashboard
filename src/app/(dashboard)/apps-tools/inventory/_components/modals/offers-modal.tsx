import { MultiSelect } from "@/app/(dashboard)/settings/_components/multi-select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useReduxAuth } from "@/hooks/use-redux-auth";
import React from "react";

export default function OffersModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [offer, setOffer] = React.useState<string>("");
  const user = useReduxAuth().user;
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={
          "bg-foreground rounded-3xl flex flex-col gap-y-3 px-4 py-5  shadow-xl w-full max-h-[90vh] max-w-[760px] overflow-y-auto"
        }
      >
        <Label>
          What kind of product offering does {user?.fullName} offer?
        </Label>
        <MultiSelect
          value={offer}
          options={[
            { label: "Product", value: "PRODUCT" },
            { label: "Services", value: "SERVICES" },
            { label: "Reservation", value: "RESERVATION" },
          ]}
          radioClassName="lg:w-full"
          className="lg:grid !grid-cols-3"
          onValueChange={(value) => {
            setOffer(value);
          }}
        />

        <Button
          className="max-w-[368px] mt-5 w-full mx-auto"
          size={"lg"}
          disabled={!offer}
          onClick={onClose}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
