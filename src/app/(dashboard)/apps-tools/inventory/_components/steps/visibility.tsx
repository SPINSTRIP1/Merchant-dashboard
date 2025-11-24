import { MultiSelect } from "@/app/(dashboard)/settings/_components/multi-select";
import SelectDropdown from "@/components/select-dropdown";
import { Label } from "@/components/ui/label";
import React from "react";

export default function Visibility() {
  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <Label>Show in Menu</Label>
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
      <div className="space-y-1.5">
        <Label>Add to Deals</Label>

        <SelectDropdown
          className="!rounded-2xl border border-neutral-accent"
          placeholder="Add to Deals"
          options={["Retail", "Food & Beverage", "Healthcare", "Technology"]}
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
