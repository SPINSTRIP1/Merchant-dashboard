import { MultiSelect } from "@/app/(dashboard)/settings/_components/multi-select";
import SelectDropdown from "@/components/select-dropdown";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React from "react";
import { useMenuForm } from "../../_context";
import { Controller } from "react-hook-form";

export default function Configuration() {
  const {
    form: { control, watch, setValue },
  } = useMenuForm();

  // const availabilityType = watch("availabilityType");
  const sizeOptions = watch("sizeOptions") || [];
  const nutritionAllergens = watch("nutritionAllergens") || [];
  const extras = watch("extras") || [];

  // Sample menu items - replace with your actual data
  const availableSizeOptions = ["Small", "Medium", "Large", "Other"];

  const toggleSizeOption = (item: string) => {
    const currentOptions = sizeOptions || [];
    if (currentOptions.includes(item)) {
      setValue(
        "sizeOptions",
        currentOptions.filter((i) => i !== item)
      );
    } else {
      setValue("sizeOptions", [...currentOptions, item]);
    }
  };

  const addNutritionAllergen = (
    name: string,
    type: "allergen" | "nutrition"
  ) => {
    if (name.trim()) {
      setValue("nutritionAllergens", [...nutritionAllergens, { name, type }]);
    }
  };

  const addExtra = ({ name, price }: { name: string; price: number }) => {
    setValue("extras", [...extras, { name, price }]);
  };

  const [extraInput, setExtraInput] = React.useState({ name: "", price: 0 });

  // const updateExtra = (
  //   index: number,
  //   field: "name" | "price",
  //   value: string | number
  // ) => {
  //   const updatedExtras = [...extras];
  //   updatedExtras[index] = { ...updatedExtras[index], [field]: value };
  //   setValue("extras", updatedExtras);
  // };
  const [nutritionInput, setNutritionInput] = React.useState("");
  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <Label>Availability</Label>
        <Controller
          control={control}
          name="availabilityType"
          render={({ field }) => (
            <MultiSelect
              value={field.value}
              options={[
                { label: "Always Available", value: "ALWAYS_AVAILABLE" },
                { label: "On Demand", value: "ON_DEMAND" },
                { label: "Specific days/time", value: "SPECIFIC_DAYS_TIME" },
                { label: "Other", value: "OTHER" },
              ]}
              onValueChange={field.onChange}
            />
          )}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Nutrition/Allergens (Optional)</Label>
        {nutritionAllergens.map((item, index) => (
          <Input
            key={index}
            className="!rounded-2xl border border-neutral-accent"
            value={item.name}
            readOnly
          />
        ))}
        <div className="flex items-center pt-2 gap-x-2">
          <button
            onClick={() => {
              if (nutritionInput.trim()) {
                addNutritionAllergen(nutritionInput, "allergen");
                setNutritionInput("");
              }
            }}
          >
            <HugeiconsIcon icon={PlusSignIcon} size={24} color={"#6F6D6D"} />
          </button>
          <Input
            className="rounded-none border-b bg-transparent border-neutral-accent"
            placeholder="Add Item"
            value={nutritionInput}
            onChange={(e) => setNutritionInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (nutritionInput.trim()) {
                  addNutritionAllergen(nutritionInput, "allergen");
                  setNutritionInput("");
                }
              }
            }}
          />
        </div>
        <p className="text-center mt-4">
          Click on the + icon or press Enter to add an item to the list.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label>Add Ons</Label>

        <Controller
          control={control}
          name="addOns"
          render={({ field }) => (
            <SelectDropdown
              className="!rounded-2xl border border-neutral-accent"
              placeholder="Choose your Add ons"
              options={["Extra Cheese", "Extra Sauce", "Extra Meat"]}
              value={field.value?.[0]?.name || ""}
              onValueChange={(value) => {
                field.onChange([{ name: value, price: 0 }]);
              }}
              category="Add Ons"
            />
          )}
        />
        <div>
          <label htmlFor="size" className="text-secondary-text text-sm">
            Size Options
          </label>
          <div className="flex flex-wrap mt-4 items-center gap-3">
            {availableSizeOptions.map((item, index) => {
              const isSelected = sizeOptions.includes(item);
              return (
                <div
                  key={index}
                  onClick={() => toggleSizeOption(item)}
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
          {extras.map((extra, index) => (
            <div key={index} className="flex items-center pt-2 gap-x-2">
              {/* <button
                type="button"
                onClick={() => addExtra()}
                className="flex-shrink-0"
              >
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  size={24}
                  color={"#6F6D6D"}
                />
              </button> */}
              <Input
                className="rounded-none border-b bg-transparent border-neutral-accent"
                placeholder="Add Item"
                defaultValue={extra.name}
              />
              <Input
                type="number"
                className="!rounded-2xl max-w-[169px] border border-neutral-accent"
                placeholder="₦0.00"
                defaultValue={extra.price || ""}
              />
            </div>
          ))}
          <div className="flex items-center pt-2 gap-x-2">
            <button
              type="button"
              onClick={() => {
                if (extraInput.name.trim() && extraInput.price >= 0)
                  addExtra(extraInput);
              }}
              className="flex-shrink-0"
            >
              <HugeiconsIcon icon={PlusSignIcon} size={24} color={"#6F6D6D"} />
            </button>
            <Input
              className="rounded-none border-b bg-transparent border-neutral-accent"
              placeholder="Add Item"
              value={extraInput.name}
              onChange={(e) =>
                setExtraInput({ ...extraInput, name: e.target.value })
              }
            />
            <Input
              type="number"
              className="!rounded-2xl max-w-[169px] border border-neutral-accent"
              placeholder="₦0.00"
              value={extraInput.price || ""}
              onChange={(e) =>
                setExtraInput({
                  ...extraInput,
                  price: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
          <p className="text-center mt-4">
            Click on the + icon to add an item to the extras list.
          </p>
        </div>
      </div>
    </div>
  );
}
