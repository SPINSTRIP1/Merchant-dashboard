import { MultiSelect } from "@/app/(dashboard)/settings/_components/multi-select";
import SelectDropdown from "@/components/select-dropdown";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React from "react";

export default function Configuration() {
  const [selectedMenuItems, setSelectedMenuItems] = React.useState<string[]>(
    []
  );

  // Sample menu items - replace with your actual data
  const availableMenuItems = ["Small", "Medium", "Large", "Other"];

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
    <div className="space-y-7">
      <div className="space-y-1.5">
        <Label>Availability</Label>
        <MultiSelect
          value={"ALWAYS"}
          options={[
            { label: "Always Available", value: "ALWAYS" },
            { label: "On Demand", value: "ON DEMAND" },
            { label: "Specific days/time", value: "SPECIFIC" },
            { label: "Other", value: "OTHER" },
          ]}
          onValueChange={(value) => {
            console.log(value);
          }}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Nutrition/Allergens (Optional)</Label>
        <Input
          className="!rounded-2xl border border-neutral-accent"
          placeholder="Enter Name of Item"
        />
        <div className="flex items-center pt-2 gap-x-2">
          <HugeiconsIcon icon={PlusSignIcon} size={24} color={"#6F6D6D"} />
          <Input
            className="rounded-none border-b bg-transparent border-neutral-accent"
            placeholder="Add Item"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Add Ons</Label>

        <SelectDropdown
          className="!rounded-2xl border border-neutral-accent"
          placeholder="Choose your Add ons"
          options={["Promo"]}
          value={""}
          onValueChange={(value) => {
            console.log(value);
          }}
          category="Categories"
        />
        <div>
          <label htmlFor="size" className="text-secondary-text text-sm">
            Size Options
          </label>
          <div className="flex flex-wrap mt-4 items-center gap-3">
            {availableMenuItems.map((item, index) => {
              const isSelected = selectedMenuItems.includes(item);
              return (
                <div
                  key={index}
                  onClick={() => toggleMenuItem(item)}
                  className={`flex cursor-pointer w-[160px] items-center py-2.5 px-2.5 gap-x-2 rounded-3xl transition-all duration-200 ${
                    isSelected
                      ? "bg-primary-accent"
                      : "bg-background-light hover:bg-gray-200"
                  }`}
                >
                  <Checkbox checked={isSelected} />
                  <p
                    className={`text-sm ${
                      isSelected ? "text-primary" : "text-gray-500"
                    }`}
                  >
                    {item}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <label htmlFor="extras" className="text-secondary-text text-sm">
            Extras
          </label>
          <div className="flex items-center pt-2 gap-x-2">
            <button className="flex-shrink-0">
              <HugeiconsIcon icon={PlusSignIcon} size={24} color={"#6F6D6D"} />
            </button>
            <Input
              className="rounded-none border-b bg-transparent border-neutral-accent"
              placeholder="Add Item"
            />
            <Input
              className="!rounded-2xl max-w-[169px] border border-neutral-accent"
              placeholder="N0.00"
            />
          </div>
          <div className="flex items-center pt-2 gap-x-2">
            <button className="flex-shrink-0">
              <HugeiconsIcon icon={PlusSignIcon} size={24} color={"#6F6D6D"} />
            </button>
            <Input
              className="rounded-none border-b bg-transparent border-neutral-accent"
              placeholder="Add Item"
            />
            <Input
              className="!rounded-2xl max-w-[169px] border border-neutral-accent"
              placeholder="N0.00"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
