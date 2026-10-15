import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/forms/form-input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import PillGroup from "@/components/pill-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Facility, facilitySchema } from "../../../_schemas";
import { useCallback, useState } from "react";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import UploadFile from "@/app/(dashboard)/_components/upload-file";
import React from "react";
import { Input } from "@/components/ui/input";
import api from "@/lib/api/axios-client";
import { SERVER_URL } from "@/constants";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const FACILITY_CATEGORIES = ["Recreation", "Food", "Exercise"];

export default function FacilityModal({
  isOpen,
  onClose,
  placeId,
}: {
  isOpen: boolean;
  onClose: () => void;
  placeId: string;
}) {
  const { control, watch, setValue, reset, getValues } = useForm<Facility>({
    resolver: zodResolver(facilitySchema),
    mode: "onChange",
    defaultValues: {
      placeId,
      name: "",
      facilityCategory: "",
      description: "",
      fees: [
        {
          name: "",
          amount: 0,
          description: "",
        },
      ],
      isGated: false,
      files: [],
      // images: [],
    },
  });
  const queryClient = useQueryClient();
  const [imageUploadFields, setImageUploadFields] = useState([0]); // Start with one field
  const files = watch("files") || [];
  const accessType = watch("accessType") || "";
  const isGated = watch("isGated") || false;
  const fees = watch("fees") || [];
  const facilityCategory = watch("facilityCategory") || "";
  const [otherSelected, setOtherSelected] = useState(false);
  // const media = watch("images") || [];

  const handleFileSelect = (file: File | null, index: number) => {
    if (!file) return;

    const currentFiles = [...files];
    currentFiles[index] = file;
    setValue("files", currentFiles);
  };

  const addImageUploadField = () => {
    setImageUploadFields([...imageUploadFields, imageUploadFields.length]);
  };

  const removeImageUploadField = (index: number) => {
    // Remove the field
    const newFields = imageUploadFields.filter((_, i) => i !== index);
    setImageUploadFields(newFields);

    // Remove the file at that index
    const currentFiles = [...files];
    currentFiles.splice(index, 1);
    setValue("files", currentFiles);
  };

  // const removeMediaImage = (index: number) => {
  //   const currentMedia = [...media];
  //   currentMedia.splice(index, 1);
  //   setValue("images", currentMedia);
  // };
  const updateFee = (
    index: number,
    field: "name" | "amount",
    value: string | number,
  ) => {
    const currentFees = [...fees];
    if (field === "name") {
      currentFees[index] = { ...currentFees[index], name: value as string };
    } else {
      currentFees[index] = { ...currentFees[index], amount: value as number };
    }
    setValue("fees", currentFees);
  };

  const addFee = () => {
    setValue("fees", [...fees, { name: "", amount: 0, description: "" }]);
  };

  const removeFee = (index: number) => {
    const currentFees = fees.filter((_, i) => i !== index);
    // Ensure at least one empty row remains
    if (currentFees.length === 0) {
      setValue("fees", [{ name: "", amount: 0, description: "" }]);
    } else {
      setValue("fees", currentFees);
    }
  };

  const handleClose = () => {
    setImageUploadFields([0]);
    reset();
    onClose();
  };
  const [loading, setLoading] = useState(false);

  const submitFacility = useCallback(async () => {
    setLoading(true);
    try {
      const { files, ...formData } = getValues();
      const res = await api.post(SERVER_URL + `/places/facilities`, formData);
      const { status, data } = res.data as {
        status: string;
        message?: string;
        data: Facility;
      };
      if (status === "success" && files && files.length > 0) {
        try {
          const formData = new FormData();

          files.forEach((file) => {
            formData.append("files", file);
          });

          await api.post(
            SERVER_URL + `/places/facilities/${data.id}/images`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            },
          );
        } catch (error) {
          console.log("Error uploading files:", error);
          toast.error(
            `Facility created successfully but failed to upload cover image and files. Please try again.`,
          );
        }
      }
      toast.success("Facility added successfully!");
      queryClient.invalidateQueries({
        queryKey: ["place-facility", formData.placeId],
      });
      handleClose();
    } catch (error) {
      console.log("Error submitting Facility:", error);
      toast.error(`Failed to add facility. Please try again.`);
    } finally {
      setLoading(false);
    }
  }, [getValues, queryClient]);
  const categoryIsPreset = FACILITY_CATEGORIES.includes(facilityCategory);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Add Facility</SheetTitle>
          <SheetDescription>Facilities are the spaces and services guests can use or book at this place.</SheetDescription>
        </SheetHeader>
        <div className="space-y-5 pb-2">
          <FormInput
            control={control}
            label="Name of Facility"
            name="name"
            placeholder="e.g. Swimming Pool"
          />

          <div className="space-y-2">
            <PillGroup
              label="Facility Type"
              options={[...FACILITY_CATEGORIES, "Other"]}
              value={categoryIsPreset ? facilityCategory : facilityCategory || otherSelected ? "Other" : undefined}
              onChange={(value) => {
                if (value === "Other") {
                  setOtherSelected(true);
                  setValue("facilityCategory", "");
                } else {
                  setOtherSelected(false);
                  setValue("facilityCategory", value);
                }
              }}
            />
            {(!categoryIsPreset && (otherSelected || facilityCategory)) && (
              <FormInput
                control={control}
                label="Describe the facility type"
                name="facilityCategory"
                placeholder="e.g. Conference room"
              />
            )}
          </div>

          <FormInput
            control={control}
            label="Description"
            name="description"
            placeholder="Describe the facility"
            type="textarea"
          />

          <div className="space-y-3">
            <Label>Upload Facility Images</Label>
            <p className="text-xs text-muted-foreground">
              The first image is used as the thumbnail. JPG, JPEG, PNG or WEBP, up to 10MB each.
            </p>
            <div className="flex flex-wrap gap-4">
              {imageUploadFields.map((fieldId, index) => (
                <div key={fieldId} className="relative w-full max-w-[158px]">
                  <UploadFile
                    label={index === 0 ? "Thumbnail" : `Image ${index + 1}`}
                    onFileSelect={(file) => handleFileSelect(file, index)}
                    value={files[index]}
                  />
                  {imageUploadFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageUploadField(index)}
                      aria-label="Remove image slot"
                      className="absolute right-1.5 top-1.5 z-10 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {imageUploadFields.length < 6 && (
              <Button type="button" onClick={addImageUploadField} variant="soft" size="sm">
                <Plus /> Add Another Image
              </Button>
            )}
          </div>

          <PillGroup
            label="Facility Access"
            options={[
              { label: "Open", value: "OPEN" },
              { label: "Priced", value: "PRICED" },
            ]}
            value={accessType || undefined}
            onChange={(value) => {
              setValue("accessType", value as "OPEN" | "PRICED");
            }}
          />

          {accessType === "PRICED" ? (
            <div className="space-y-2">
              <Label>Priced Facility Price</Label>
              {fees.map((fee, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    className="h-11 flex-1"
                    placeholder="Fee name, e.g. Day pass"
                    value={fee.name || ""}
                    onChange={(e) => updateFee(index, "name", e.target.value)}
                  />
                  <Input
                    type="number"
                    className="h-11 w-36"
                    placeholder="₦0.00"
                    value={fee.amount || ""}
                    onChange={(e) =>
                      updateFee(index, "amount", parseFloat(e.target.value) || 0)
                    }
                  />
                  {fees.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFee(index)}
                      aria-label="Remove fee"
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-rose-500 hover:bg-rose-500/10"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <Button type="button" onClick={addFee} variant="soft" size="sm">
                <Plus /> Add Fee
              </Button>
            </div>
          ) : accessType === "OPEN" ? (
            <>
              <PillGroup
                label="Is the facility free or gated (requires a gate fee)?"
                options={[
                  { label: "Free", value: "FREE" },
                  { label: "Gated", value: "GATED" },
                ]}
                value={isGated ? "GATED" : "FREE"}
                onChange={(value) => {
                  setValue("isGated", value === "GATED");
                }}
              />
              {isGated && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px]">
                  <FormInput
                    control={control}
                    label="Create Gate"
                    name="fees.0.name"
                    placeholder="Enter gate name"
                  />
                  <FormInput
                    control={control}
                    label="Gate Fee"
                    name="fees.0.amount"
                    placeholder="₦0.00"
                    type="number"
                  />
                </div>
              )}
            </>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-3 border-t pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="brand" onClick={submitFacility} disabled={loading}>
            {loading ? "Submitting..." : "Add Facility"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
