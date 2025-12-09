import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { useCatalogs } from "../../_hooks/use-catalogs";
import { useInventoryForm } from "../../_context";
import SelectDropdown from "@/components/select-dropdown";
import { Info, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MultiSelectWithTooltip } from "@/components/multi-select-with-tooltip";
import UploadImages from "./upload-images";

export default function GeneralInfo() {
  const { catalogs } = useCatalogs();
  const {
    form: { watch, register, setValue },
    handleFieldChange,
  } = useInventoryForm();
  const [currentTagInput, setCurrentTagInput] = React.useState("");
  const catalogId = watch("catalogId");
  const categoryId = watch("categoryId");
  const tags = watch("tags");

  // Get categories based on selected catalog
  const categories = React.useMemo(() => {
    if (!catalogs || !catalogId) return [];
    const selectedCatalog = catalogs.find((cat) => cat.id === catalogId);
    return selectedCatalog
      ? selectedCatalog.categories.map((cat) => ({
          label: cat.name,
          value: cat.id,
        }))
      : [];
  }, [catalogs, catalogId]);

  const addTag = () => {
    if (currentTagInput.trim() && !tags.includes(currentTagInput.trim())) {
      setValue("tags", [...tags, currentTagInput.trim()]);
      setCurrentTagInput("");
    }
  };
  const removeTag = (tagToRemove: string) => {
    setValue(
      "tags",
      tags.filter((tag) => tag !== tagToRemove)
    );
  };

  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <Label>Product Name</Label>
        <Input
          {...register("name")}
          className="!rounded-2xl border border-neutral-accent"
          placeholder="Enter Product name"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Product Description</Label>
        <Textarea
          {...register("description")}
          className="rounded-2xl"
          placeholder="Enter description"
          rows={6}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Select Catalog</Label>

        <SelectDropdown
          className="!rounded-2xl border border-neutral-accent"
          placeholder="Select Catalog"
          value={catalogId || ""}
          options={catalogs?.map((cat) => ({ label: cat.name, value: cat.id }))}
          onValueChange={(value) => {
            handleFieldChange("catalogId", value);
            // Reset category when catalog changes
            handleFieldChange("categoryId", "");
          }}
          category="Catalog"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Select Categories</Label>

        <SelectDropdown
          className="!rounded-2xl border border-neutral-accent"
          placeholder="Select Categories"
          value={categoryId || ""}
          options={categories}
          onValueChange={(value) => {
            handleFieldChange("categoryId", value);
          }}
          category="Categories"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Tags</Label>
        <div className="flex items-center gap-2">
          <Input
            className="!rounded-2xl border border-neutral-accent"
            placeholder='Enter Item Tag e.g "Best Seller"'
            value={currentTagInput}
            onChange={(e) => setCurrentTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button
            type="button"
            onClick={addTag}
            size="icon"
            variant="secondary"
          >
            <Plus />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-accent rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-x-1 text-secondary-text">
          <Info size={14} />
          <p className="text-xs">
            Add at least 3 tags to your product to make it more discoverable.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label>Selling Price</Label>
          <Input
            {...register("sellingPrice")}
            className="!rounded-2xl border border-neutral-accent"
            placeholder="N7,500.00"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Cost Price</Label>
          <Input
            {...register("costPrice")}
            className="!rounded-2xl border border-neutral-accent"
            placeholder="N5,000.00"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Product Type</Label>
        <MultiSelectWithTooltip
          value={watch("productType")}
          options={[
            {
              label: "Definite",
              value: "DEFINITE",
              description:
                "Products with fixed quantity tracking. Inventory decreases with each sale (e.g., physical goods, packaged items).",
            },
            {
              label: "Indefinite",
              value: "INFINITE",
              description:
                "Products without quantity limits. Used for services, digital goods, or items with unlimited availability.",
            },
          ]}
          className="lg:grid"
          radioClassName="lg:w-full"
          onValueChange={(value) => {
            handleFieldChange("productType", value);
          }}
        />
        {/* <SelectDropdown
          className="!rounded-2xl border border-neutral-accent"
          placeholder="Select Product Type"
          value={watch("productType")}
          options={[
            { label: "Definite", value: "DEFINITE" },
            { label: "Indefinite", value: "INDEFINITE" },
          ]}
          onValueChange={(value) => {
            handleFieldChange("productType", value);
          }}
          category="Product Type"
        /> */}
      </div>
      <div className="space-y-1.5">
        <Label>Brand</Label>
        <Input
          {...register("brand")}
          className="!rounded-2xl border border-neutral-accent"
          placeholder="Enter Brand"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Variants</Label>

        <div className="flex items-center pt-2 gap-x-3">
          <p>Color:</p>
          <Input
            className="rounded-none border-b pl-0 bg-transparent border-neutral-accent"
            placeholder="e.g. Blue, Green, burgundy, etc."
            {...register("variant.color")}
          />
        </div>
        <div className="flex items-center pt-2 gap-x-3">
          <p>Size:</p>
          <Input
            className="rounded-none border-b pl-0 bg-transparent border-neutral-accent"
            placeholder="e.g. Inches, cm, litre, medium, large, etc."
            {...register("variant.size")}
          />
        </div>
        <div className="flex items-center pt-2 gap-x-3">
          <p>Dimensions:</p>
          <Input
            className="rounded-none border-b pl-0 bg-transparent border-neutral-accent"
            placeholder="e.g. Length, breadth, depth, or height, etc"
            {...register("variant.dimensions")}
          />
        </div>
        <div className="flex items-center pt-2 gap-x-3">
          <p>Shape:</p>
          <Input
            className="rounded-none border-b pl-0 bg-transparent border-neutral-accent"
            placeholder="e.g. Circle, square, triangle, rectangle, oval, etc"
            {...register("variant.shape")}
          />
        </div>
        <div className="flex items-center pt-2 gap-x-3">
          <p>Form:</p>
          <Input
            className="rounded-none border-b pl-0 bg-transparent border-neutral-accent"
            placeholder="e.g. Solid, liquid, gas, etc."
            {...register("variant.form")}
          />
        </div>
      </div>
      <UploadImages />
    </div>
  );
}
