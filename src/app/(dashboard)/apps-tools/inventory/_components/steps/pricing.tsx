import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { useInventoryForm } from "../../_context";

export default function Pricing() {
  const {
    form: { register },
  } = useInventoryForm();

  return (
    <div className="space-y-7">
      {/* <div className="space-y-1.5">
        <Label>Price (Base)</Label>
        <Input
          className="!rounded-2xl border border-neutral-accent"
          placeholder="N7,000"
        />
      </div> */}
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label>Discount (Optional)</Label>
          <Input
            className="!rounded-2xl border border-neutral-accent"
            placeholder="30%"
            {...register("discountPercentage")}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Tax (Optional)</Label>
          <Input
            {...register("taxPercentage")}
            className="!rounded-2xl border border-neutral-accent"
            placeholder="12%"
          />
        </div>
      </div>
    </div>
  );
}
