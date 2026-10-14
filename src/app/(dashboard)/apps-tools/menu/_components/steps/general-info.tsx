import { Label } from "@/components/ui/label";
import { FormInput } from "@/components/ui/forms/form-input";
import PillGroup from "@/components/pill-group";
import { useMenuForm } from "../../_context";
import type { MenuStatus } from "../../_schemas";
import CategoryPicker from "../category-picker";

const STATUS_OPTIONS: { value: MenuStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Available" },
  { value: "PENDING", label: "Pending" },
  { value: "UNAVAILABLE", label: "Out of Stock" },
];

export default function GeneralInfo() {
  const {
    form: { watch, control, formState },
    handleFieldChange,
  } = useMenuForm();
  const status = watch("status");
  const category = watch("category");

  return (
    <div className="space-y-5">
      <FormInput
        control={control}
        label="Item Name"
        name="name"
        placeholder="e.g. Jollof Rice and Chicken"
      />
      <div className="grid grid-cols-2 gap-3">
        <FormInput control={control} label="Price (₦)" name="price" placeholder="4,000" type="number" />
        <FormInput control={control} label="Quantity" name="quantity" placeholder="0" type="number" />
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <CategoryPicker value={category} onChange={(value) => handleFieldChange("category", value)} />
        {formState.errors.category && (
          <p className="text-[11px] font-medium text-destructive">{formState.errors.category.message}</p>
        )}
      </div>
      <PillGroup
        label="Status"
        options={STATUS_OPTIONS}
        value={status}
        onChange={(value) => handleFieldChange("status", value)}
      />
      <FormInput
        control={control}
        label="Tag"
        name="tag"
        placeholder='e.g. "Best Seller"'
        description='Items tagged "Best Seller" appear under "Popular here" on your public menu.'
      />
      <FormInput
        control={control}
        label="Description"
        name="description"
        placeholder="Describe the dish…"
        type="textarea"
      />
    </div>
  );
}
