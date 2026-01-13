import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/forms/form-input";
import SideModal from "@/app/(dashboard)/_components/side-modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Facility, facilitySchema } from "../../../_schemas";
import { useCallback, useState } from "react";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import UploadFile from "@/app/(dashboard)/_components/upload-file";
import { MultiSelect } from "@/app/(dashboard)/settings/_components/multi-select";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React from "react";
import { Input } from "@/components/ui/input";
import api from "@/lib/api/axios-client";
import { SERVER_URL } from "@/constants";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

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
        // {
        //   tierName: "",
        //   amount: 0,
        //   tierLevel: 1,
        //   description: "",
        // },
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
  const addFees = ({ name, price }: { name: string; price: number }) => {
    setValue("fees", [...fees, { name, amount: price, description: "" }]);
  };

  const [feesInput, setFeesInput] = React.useState({ name: "", price: 0 });
  const handleClose = () => {
    setFeesInput({ name: "", price: 0 });
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
      console.log(res);
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
            }
          );
        } catch (error) {
          console.log("Error uploading files:", error);
          toast.error(
            `Facility created successfully but failed to upload cover image and files. Please try again.`
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
  }, [getValues, queryClient, handleClose]);
  return (
    <SideModal isOpen={isOpen} onClose={handleClose}>
      <div className="space-y-7 pt-14 pb-5">
        <FormInput
          control={control}
          label="Facility Type"
          name="facilityCategory"
          placeholder="Enter Facility Type"
        />
        <FormInput
          control={control}
          label="Name of Facility"
          name="name"
          placeholder="Enter Name of Facility"
        />

        <FormInput
          control={control}
          label="Description"
          name="description"
          placeholder="Describe the Place"
          type="textarea"
        />

        <div className="space-y-3 w-full">
          <Label>Upload Facility Images</Label>

          {/* Display existing media images from server */}
          {
            <div className="flex gap-4 flex-wrap mb-4">
              {/* {media.length > 0 &&
            media.map((imageUrl, index) => (
              <div
                key={`media-${index}`}
                className="relative w-[158px] h-[169px]"
              >
                <Image
                  src={imageUrl}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover rounded-2xl border border-neutral-accent"
                />
                <button
                  type="button"
                  onClick={() => removeMediaImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                >
                  <X size={16} />
                </button>
              </div>
            ))} */}
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
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          }

          <div className="flex items-center justify-center flex-col pt-2">
            <p className="text-sm text-gray-600">
              Click to upload or drag and drop images
            </p>
            <span className="text-[9px] font-semibold text-gray-500">
              JPG, JPEG, PNG, WEBP formats supported (Max 10MB per image)
            </span>
          </div>
          {/* Add more images button */}
          {imageUploadFields.length < 6 && (
            <div className="flex justify-center mt-4">
              <Button
                type="button"
                onClick={addImageUploadField}
                variant="secondary"
                className="md:w-auto"
              >
                <Plus className="mr-2" size={18} />
                Add Another Image
              </Button>
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Facility Access</Label>
          <MultiSelect
            value={accessType}
            options={[
              { label: "Open", value: "OPEN" },
              { label: "Priced", value: "PRICED" },
            ]}
            radioClassName="!w-full"
            className="!grid !grid-cols-2"
            onValueChange={(value) => {
              setValue("accessType", value as "OPEN" | "PRICED");
            }}
          />
        </div>
        {accessType === "PRICED" ? (
          <div>
            <label htmlFor="extras" className="text-secondary-text text-sm">
              Priced Facility Price
            </label>
            {fees.map((fee, index) => (
              <div key={index} className="flex items-center pt-2 gap-x-2">
                {/* <button
                type="button"
                onClick={() => addFees()}
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
                  defaultValue={fee.name}
                />
                <Input
                  type="number"
                  className="!rounded-2xl max-w-[169px] border border-neutral-accent"
                  placeholder="₦0.00"
                  defaultValue={fee.amount || ""}
                />
              </div>
            ))}
            <div className="flex items-center pt-2 gap-x-2">
              <button
                type="button"
                onClick={() => {
                  if (feesInput.name.trim() && feesInput.price >= 0)
                    addFees(feesInput);
                }}
                className="flex-shrink-0"
              >
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  size={24}
                  color={"#6F6D6D"}
                />
              </button>
              <Input
                className="rounded-none border-b bg-transparent border-neutral-accent"
                placeholder="Add Item"
                value={feesInput.name}
                onChange={(e) =>
                  setFeesInput({ ...feesInput, name: e.target.value })
                }
              />
              <Input
                type="number"
                className="!rounded-2xl max-w-[169px] border border-neutral-accent"
                placeholder="₦0.00"
                value={feesInput.price || ""}
                onChange={(e) =>
                  setFeesInput({
                    ...feesInput,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <p className="text-center mt-4">
              Click on the + icon to add an item to the extras list.
            </p>
          </div>
        ) : accessType === "OPEN" ? (
          <>
            <div className="space-y-1.5">
              <Label>Is the Facility Free or Gated (requires gate fee)?</Label>
              <MultiSelect
                value={isGated ? "GATED" : "FREE"}
                options={[
                  { label: "Free", value: "FREE" },
                  { label: "Gated", value: "GATED" },
                ]}
                radioClassName="!w-full"
                className="!grid !grid-cols-2"
                onValueChange={(value) => {
                  setValue("isGated", value === "GATED");
                }}
              />
            </div>
            <div className="grid grid-cols-[1fr_202px] gap-4">
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
                placeholder="N0.00"
                type="number"
              />
            </div>
          </>
        ) : null}
        <div className="flex justify-center mt-6 gap-x-3 items-center">
          <Button
            onClick={submitFacility}
            className="w-[368px] h-[51px] py-3"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Add Facility"}
          </Button>
        </div>
      </div>
    </SideModal>
  );
}
