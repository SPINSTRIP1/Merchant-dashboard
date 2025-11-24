import { MultiSelect } from "@/app/(dashboard)/settings/_components/multi-select";
import SelectDropdown from "@/components/select-dropdown";
import { Label } from "@/components/ui/label";
import React from "react";

export default function DealSettings() {
  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <Label>Mark as Featured</Label>
        <MultiSelect
          value={""}
          options={[
            { label: "Yes", value: "YES" },
            { label: "No", value: "NO" },
          ]}
          className="lg:grid"
          radioClassName="lg:w-full"
          onValueChange={(value) => {
            console.log(value);
          }}
        />
      </div>
      <div className=" flex flex-col">
        <Label>Apply a campaign (Deals)</Label>
        <input
          className="text-xs my-1.5 outline-none"
          placeholder="Brief description of this option goes here..."
        />

        <SelectDropdown
          className="!rounded-2xl mt-2 border border-neutral-accent"
          placeholder="Select Deals"
          options={["Promo"]}
          value={""}
          onValueChange={(value) => {
            console.log(value);
          }}
          category="Deals"
        />
      </div>
    </div>
  );
}
