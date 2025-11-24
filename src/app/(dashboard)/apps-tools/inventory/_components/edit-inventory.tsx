import { MultiSelect } from "@/app/(dashboard)/settings/_components/multi-select";
import SelectDropdown from "@/components/select-dropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import React from "react";

export default function EditInventory({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-7 pt-16 pb-5">
      <div className="space-y-1.5">
        <Label>Item Name</Label>
        <Input
          className="!rounded-2xl border border-neutral-accent"
          placeholder="Enter Company Name"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Category</Label>

        <SelectDropdown
          className="!rounded-2xl border border-neutral-accent"
          placeholder="Choose category"
          options={["Retail", "Food & Beverage", "Healthcare", "Technology"]}
          value={""}
          onValueChange={(value) => {
            console.log(value);
          }}
          category="Business Category"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Item Description</Label>
        <Textarea
          className="rounded-2xl"
          placeholder="Enter description"
          rows={6}
        />
      </div>
      <div className="flex overflow-x-scroll gap-5 mt-4 items-center">
        {["/item-2.jpg", "/item.jpg", "/item.jpg"].map((img, index) => (
          <div
            key={index}
            className="min-w-[253px] h-[206px] rounded-lg overflow-hidden"
          >
            <Image
              src={img}
              width={253}
              height={206}
              alt="Images"
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label>Price</Label>
          <Input
            className="!rounded-2xl border border-neutral-accent"
            placeholder="N7,000"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Quantity</Label>
          <Input
            className="!rounded-2xl border border-neutral-accent"
            placeholder="50 Portions"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Discount (Optional)</Label>
          <Input
            className="!rounded-2xl border border-neutral-accent"
            placeholder="30%"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Tax (Optional)</Label>
          <Input
            className="!rounded-2xl border border-neutral-accent"
            placeholder="12%"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>SKU/ID</Label>
        <Input
          className="!rounded-2xl border border-neutral-accent"
          placeholder="0001"
        />
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label>Quanitity in Stock</Label>
          <Input
            className="!rounded-2xl border border-neutral-accent"
            placeholder="95"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Reorder Threshold</Label>
          <Input
            className="!rounded-2xl border border-neutral-accent"
            placeholder="10%"
          />
        </div>
      </div>
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
      <div className="flex mt-6 gap-x-3 items-center">
        <Button
          variant={"secondary"}
          className="w-full h-[51px] py-3"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button className="w-full h-[51px] py-3" onClick={onClose}>
          Update
        </Button>
      </div>
    </div>
  );
}
