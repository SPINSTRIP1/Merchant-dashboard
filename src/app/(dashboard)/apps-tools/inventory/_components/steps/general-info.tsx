import { MultiSelect } from "@/app/(dashboard)/settings/_components/multi-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import UploadFile from "../upload-file";
import { useCatalogs } from "../../_hooks/use-catalogs";
import { useInventoryForm } from "../../_context";
import SelectDropdown from "@/components/select-dropdown";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    handleFieldChange("files", [...(watch("files") || []), file]);
  };

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
          placeholder="Enter Company Name"
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
            placeholder='Enter Item Tag e.g "🔥 Best Seller"'
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
      </div>
      <div className="space-y-1.5">
        <Label>Category</Label>
        <MultiSelect
          value={categoryId || ""}
          options={categories}
          onValueChange={(value) => {
            handleFieldChange("categoryId", value);
          }}
        />
      </div>

      <div className="space-y-1.5 w-full">
        <Label>Upload Item Images</Label>
        <div className="flex w-full gap-4 flex-wrap">
          <UploadFile
            fileName="thumbnail"
            label="Thumbnail"
            onFileSelect={handleFileSelect}
          />
          <UploadFile fileName="thumbnail" onFileSelect={handleFileSelect} />
          <UploadFile fileName="thumbnail" onFileSelect={handleFileSelect} />
          <UploadFile fileName="thumbnail" onFileSelect={handleFileSelect} />
        </div>
      </div>
      <div className="flex items-center justify-center flex-col">
        <p className={"text-sm"}>Click to upload logo or drop image here</p>
        <span className="text-[9px] font-semibold text-gray-500">
          JPG, JPEG, PNG, GIF formats supported
        </span>
      </div>
    </div>
  );
}
