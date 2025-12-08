import { Label } from "@/components/ui/label";
import { useMenuForm } from "../../_context";
import { MultiSelect } from "@/app/(dashboard)/settings/_components/multi-select";
import { FormInput } from "@/components/ui/forms/form-input";

export default function GeneralInfo() {
  const {
    form: { watch, control },
    handleFieldChange,
  } = useMenuForm();
  const status = watch("status");
  const category = watch("category");
  return (
    <div className="space-y-7">
      <FormInput
        control={control}
        label="Item Name"
        name="name"
        placeholder="Enter Name of Item"
      />
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          control={control}
          label="Price"
          name="price"
          placeholder="Enter Price (NGN)"
          type="number"
        />
        <FormInput
          control={control}
          label="Quantity"
          name="quantity"
          placeholder="Enter Quantity"
          type="number"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Category</Label>
        <MultiSelect
          value={category}
          options={[
            { label: "Breakfast", value: "BREAKFAST" },
            { label: "Lunch", value: "LUNCH" },
            { label: "Dinner", value: "DINNER" },
            { label: "Add Category", value: "OTHER" },
          ]}
          onValueChange={(value) => {
            handleFieldChange("category", value);
          }}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Status</Label>
        <MultiSelect
          value={status}
          options={[
            { label: "Available", value: "AVAILABLE" },
            { label: "Pending", value: "PENDING" },
            { label: "Unavailable", value: "UNAVAILABLE" },
          ]}
          radioClassName="!w-full"
          className="!grid !grid-cols-2 md:!grid-cols-3"
          onValueChange={(value) => {
            handleFieldChange("status", value);
          }}
        />
      </div>
      <FormInput
        control={control}
        label="Tag"
        name="tag"
        placeholder='Enter Item Tag e.g "🔥 Best Seller"'
      />
      <FormInput
        control={control}
        label="Item Description"
        name="description"
        placeholder="Describe the menu item"
        type="textarea"
      />
    </div>
  );
}
