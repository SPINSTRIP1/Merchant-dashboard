import StepIndicator from "@/app/(dashboard)/settings/_components/step-indicator";
import SelectDropdown from "@/components/select-dropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { catalogSchema, type Catalog } from "../../_schemas";
import toast from "react-hot-toast";
import api from "@/lib/api/axios-client";
import { INVENTORY_SERVER_URL } from "@/constants";
import SideModal from "@/app/(dashboard)/_components/side-modal";

export default function CatalogModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentTagInput, setCurrentTagInput] = useState("");
  const [currentCategoryTagInput, setCurrentCategoryTagInput] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
    reset,
    clearErrors,
    getValues,
  } = useForm<Catalog>({
    resolver: zodResolver(catalogSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      industry: "",
      tags: [],
      categories: [
        {
          name: "",
          description: "",
          tags: [],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "categories",
  });

  const tags = watch("tags");

  const handleClose = () => {
    setTimeout(() => {
      onClose();
      reset();
      setCurrentStep(1);
    }, 300);
  };

  const handleNext = async () => {
    if (currentStep === 2) {
      setLoading(true);
      try {
        const payload = getValues();
        delete payload.industry;
        await api.post(INVENTORY_SERVER_URL + "/catalogs", payload);
        toast.success("Catalog created successfully!");
        handleClose();
        return;
      } catch (error) {
        console.log(error);
        toast.error("Failed to create catalog. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    // Trigger validation for step 1 fields
    const isValid = await trigger(["name", "description", "industry", "tags"]);

    if (isValid) {
      setCurrentStep(2);
    }
  };

  const addTag = () => {
    if (currentTagInput.trim() && !tags.includes(currentTagInput.trim())) {
      setValue("tags", [...tags, currentTagInput.trim()]);
      setCurrentTagInput("");
      clearErrors("tags");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue(
      "tags",
      tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const addCategoryTag = (categoryIndex: number) => {
    if (currentCategoryTagInput.trim()) {
      const currentTags = watch(`categories.${categoryIndex}.tags`) || [];
      if (!currentTags.includes(currentCategoryTagInput.trim())) {
        setValue(`categories.${categoryIndex}.tags`, [
          ...currentTags,
          currentCategoryTagInput.trim(),
        ]);
        setCurrentCategoryTagInput("");
      }
    }
  };

  const removeCategoryTag = (categoryIndex: number, tagToRemove: string) => {
    const currentTags = watch(`categories.${categoryIndex}.tags`) || [];
    setValue(
      `categories.${categoryIndex}.tags`,
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-7">
            <div className="space-y-1.5">
              <Label>Catalog Name</Label>
              <Input
                {...register("name")}
                className="!rounded-2xl border border-neutral-accent"
                placeholder="Enter name of catalog"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Catalog Description</Label>
              <Textarea
                {...register("description")}
                className="rounded-2xl"
                placeholder="Describe the catalog"
                rows={6}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Industry</Label>
              <SelectDropdown
                className="!rounded-2xl border border-neutral-accent"
                placeholder="Select Industry"
                options={["Music", "Food & Beverage", "Retail", "Healthcare"]}
                value={watch("industry") || ""}
                onValueChange={(value) =>
                  setValue("industry", value, { shouldValidate: true })
                }
                category="Industry"
              />
              {errors.industry && (
                <p className="text-sm text-red-500">
                  {errors.industry.message}
                </p>
              )}
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
              {errors.tags && (
                <p className="text-sm text-red-500">{errors.tags.message}</p>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-7">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 p-4 border rounded-2xl">
                {fields.length > 1 && (
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Category {index + 1}</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label>Category Name</Label>
                  <Input
                    {...register(`categories.${index}.name`)}
                    className="!rounded-2xl border border-neutral-accent"
                    placeholder="Enter name of category"
                  />
                  {errors.categories?.[index]?.name && (
                    <p className="text-sm text-red-500">
                      {errors.categories[index]?.name?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Category Description</Label>
                  <Textarea
                    {...register(`categories.${index}.description`)}
                    className="rounded-2xl"
                    placeholder="Describe the category"
                    rows={6}
                  />
                  {errors.categories?.[index]?.description && (
                    <p className="text-sm text-red-500">
                      {errors.categories[index]?.description?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Tags</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      className="!rounded-2xl border border-neutral-accent"
                      placeholder='Enter Category Tag e.g "🔥 Best Seller"'
                      value={currentCategoryTagInput}
                      onChange={(e) =>
                        setCurrentCategoryTagInput(e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCategoryTag(index);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => addCategoryTag(index)}
                      size="icon"
                      variant="secondary"
                    >
                      <Plus />
                    </Button>
                  </div>
                  {watch(`categories.${index}.tags`)?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {watch(`categories.${index}.tags`).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-accent rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeCategoryTag(index, tag)}
                            className="hover:text-red-500"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {errors.categories?.[index]?.tags && (
                    <p className="text-sm text-red-500">
                      {errors.categories[index]?.tags?.message}
                    </p>
                  )}
                </div>
              </div>
            ))}

            <div className="w-full flex items-center justify-center">
              <Button
                type="button"
                className="max-w-[368px] w-full"
                size={"lg"}
                variant={"secondary"}
                onClick={() =>
                  append({
                    name: "",
                    description: "",
                    tags: [],
                  })
                }
              >
                <Plus />
                <p>Add more category</p>
              </Button>
            </div>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <SideModal isOpen={isOpen} onClose={onClose}>
      <StepIndicator
        className="mb-16 mt-10 pr-5 md:mt-0 w-full justify-end items-end"
        currentStep={currentStep}
        steps={["Create Catalog", "Create Category"]}
      />
      {renderContent()}
      <div className="w-full gap-x-2 flex items-center mt-5 justify-center">
        <Button
          type="button"
          className="w-full"
          size={"lg"}
          variant={"secondary"}
          onClick={() => setCurrentStep(1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          className="w-full"
          size={"lg"}
          onClick={handleNext}
          disabled={loading}
        >
          {loading ? "Submitting..." : currentStep === 2 ? "Submit" : "Next"}
        </Button>
      </div>
    </SideModal>
  );
}
