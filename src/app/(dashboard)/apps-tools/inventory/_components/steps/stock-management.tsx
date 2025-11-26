import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { useInventoryForm } from "../../_context";

export default function StockManagement() {
  const {
    form: { register },
  } = useInventoryForm();

  return (
    <div className="space-y-7">
      {/* <div className="space-y-1.5">
        <Label>SKU/ID</Label>
        <Input
          className="!rounded-2xl border border-neutral-accent"
          placeholder="0001"
        />
      </div> */}
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label>Quantity in Stock</Label>
          <Input
            className="!rounded-2xl border border-neutral-accent"
            placeholder="85"
            {...register("quantity")}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Reorder Threshold</Label>
          <Input
            className="!rounded-2xl border border-neutral-accent"
            placeholder="12%"
          />
        </div>
      </div>
    </div>
  );
}
