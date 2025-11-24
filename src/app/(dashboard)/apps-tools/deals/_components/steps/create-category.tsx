import SelectDropdown from "@/components/select-dropdown";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React from "react";

export default function CreateCategory() {
  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <Label>Category Name</Label>
        <Input
          className="!rounded-2xl border border-neutral-accent"
          placeholder="Enter name of category"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Category Description</Label>
        <Textarea
          className="rounded-2xl"
          placeholder="Describe the category"
          rows={6}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Categories</Label>

        <SelectDropdown
          className="!rounded-2xl border border-neutral-accent"
          placeholder="Select categories"
          options={["Retail", "Food & Beverage", "Healthcare", "Technology"]}
          value={""}
          onValueChange={(value) => {
            console.log(value);
          }}
          category="Categories"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Tag</Label>
        <Input
          className="!rounded-2xl border border-neutral-accent"
          placeholder="Enter Item Tag e.g “🔥 Best Seller”"
        />
      </div>
    </div>
  );
}
