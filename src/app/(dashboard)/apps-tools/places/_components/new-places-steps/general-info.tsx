import React from "react";
import { usePlacesForm } from "../../_context";
import { FormArrayInput } from "@/components/ui/forms/form-array-input";
import { FormInput } from "@/components/ui/forms/form-input";
import { PLACE_TYPES } from "../../_constants";
import { AddressAutocomplete } from "../address-autocomplete";
import { FormUploadImage } from "@/components/ui/forms/form-upload-image";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export default function GeneralInfo() {
  const {
    form: { control, setValue, watch },
  } = usePlacesForm();
  const placeType = watch("placeType");
  return (
    <div className="space-y-7 py-5">
      <FormInput
        control={control}
        label="Name of Place"
        name="name"
        placeholder="Enter Name of Place"
      />
      {/* <FormInput
        control={control}
        label="Type of Place"
        name="placeType"
        placeholder="Type of Place"
        options={PLACE_TYPES}
      /> */}
      <div className="space-y-1.5">
        <Label>Type of Place</Label>
        <div className="flex gap-2 flex-wrap">
          {PLACE_TYPES.map((type) => (
            <div
              key={type.value}
              onClick={() =>
                //@ts-expect-error: ignore
                setValue("placeType", type.value, { shouldValidate: true })
              }
              className={cn(
                "flex items-center cursor-pointer gap-x-1  rounded-full px-1 py-0.5 border ",
                placeType === type.value
                  ? "bg-primary-accent border-primary text-primary"
                  : "bg-foreground border-neutral-accent text-neutral-accent"
              )}
            >
              <HugeiconsIcon
                icon={type.icon}
                size={20}
                color={placeType === type.value ? "#6932E2" : "#C8C8C8"}
              />
              <span className="text-sm text-inherit">{type.label}</span>
            </div>
          ))}
        </div>
      </div>

      <FormInput
        control={control}
        label="Description"
        name="description"
        placeholder="Describe the Place"
        type="textarea"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        <FormInput
          control={control}
          label="City"
          name="city"
          placeholder="City"
        />
        <FormInput
          control={control}
          label="State"
          name="state"
          placeholder="State"
        />
        <FormInput
          control={control}
          label="Country"
          name="country"
          placeholder="Country"
        />
      </div>
      <AddressAutocomplete
        control={control}
        name="address"
        label="Address"
        placeholder="Enter Street Name and Number"
        onSelect={(suggestion) => {
          setValue("latitude", suggestion.location.lat);
          setValue("longitude", suggestion.location.lng);
        }}
      />
      <FormInput
        control={control}
        label="Closest Landmarks"
        name="landmarks"
        placeholder="Landmark"
      />
      <FormUploadImage
        control={control}
        name="coverImage"
        label="Upload Cover Image"
        description="Click to upload image or drop image here"
      />

      <FormArrayInput
        control={control}
        name="emails"
        label="Contact Email"
        placeholder="Add Contact Email"
        type="email"
        description="Click on the + icon or press Enter to add an email."
      />

      <FormArrayInput
        control={control}
        name="phoneNumbers"
        label="Contact Phone Numbers"
        placeholder="Add Phone Number"
        type="tel"
        description="Click on the + icon or press Enter to add a phone number."
      />
      <FormInput
        control={control}
        label="Website (Optional)"
        name="website"
        placeholder="Enter Website URL"
      />
      <FormInput
        control={control}
        label="Amenities"
        name="metadata.amenities"
        placeholder="Enter Amenities (comma separated)"
      />
    </div>
  );
}
