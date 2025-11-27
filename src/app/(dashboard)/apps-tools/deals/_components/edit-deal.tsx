import { MultiSelect } from "@/app/(dashboard)/settings/_components/multi-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React from "react";

export default function CreateOrEditDeal({
  onClose,
  onUpdate,
}: {
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [selectedMenuItems, setSelectedMenuItems] = React.useState<string[]>(
    []
  );

  // Sample menu items - replace with your actual data
  const availableMenuItems = [
    "Jollof Rice and Chicken",
    "Fried Rice and Chicken",
    "Asun Rice",
    "Goat Meat Pepper Soup",
  ];

  const toggleMenuItem = (item: string) => {
    setSelectedMenuItems((prev) => {
      if (prev.includes(item)) {
        // Remove item if already selected
        return prev.filter((i) => i !== item);
      } else {
        // Add item if not selected
        return [...prev, item];
      }
    });
  };

  return (
    <div className="space-y-7 pt-16 pb-5">
      <div className="space-y-1.5">
        <Label>Deal Name</Label>
        <Input
          className="!rounded-2xl border border-neutral-accent"
          placeholder="Enter Deal Name"
        />
      </div>
      <div>
        <Label>Menu items</Label>
        <div className="!rounded-2xl my-2 !h-[49px] border bg-neutral border-neutral-accent flex flex-col justify-center px-4">
          <p className="text-secondary-text text-sm">
            {selectedMenuItems.join(", ")}
          </p>
        </div>

        <div className="flex flex-wrap mt-4 items-center gap-3">
          {availableMenuItems.map((item, index) => {
            const isSelected = selectedMenuItems.includes(item);
            return (
              <button
                key={index}
                type="button"
                onClick={() => toggleMenuItem(item)}
                className={`flex items-center py-0.5 px-1.5 gap-x-2 rounded-3xl border w-fit transition-all duration-200 ${
                  isSelected
                    ? "border-primary bg-primary-accent"
                    : "border-gray-300 bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <p
                  className={`text-sm ${
                    isSelected ? "text-primary" : "text-gray-500"
                  }`}
                >
                  {item}
                </p>
                {isSelected && (
                  <HugeiconsIcon
                    icon={CheckmarkCircle01Icon}
                    size={16}
                    color="#6932E2"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Deal Description</Label>
        <Textarea
          className="rounded-2xl"
          placeholder="Enter description"
          rows={6}
        />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label>Discount</Label>
          <Input
            className="!rounded-2xl border border-neutral-accent"
            placeholder="10%"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Maximum Threshold</Label>
          <Input
            className="!rounded-2xl border border-neutral-accent"
            placeholder="500 Orders"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Quantity</Label>
        <Input
          className="!rounded-2xl border border-neutral-accent"
          placeholder="50 Portions"
        />
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label>Start Date</Label>
          <Input
            type="date"
            className="!rounded-2xl inline-block border border-neutral-accent"
            placeholder="95"
          />
        </div>
        <div className="space-y-1.5">
          <Label>End Date</Label>
          <Input
            type="date"
            className="!rounded-2xl inline-block border border-neutral-accent"
            placeholder="95"
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

      <div className="flex mt-6 gap-x-3 items-center">
        <Button
          variant={"secondary"}
          className="w-full h-[51px] py-3"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button className="w-full h-[51px] py-3" onClick={onUpdate}>
          Update
        </Button>
      </div>
    </div>
  );
}
