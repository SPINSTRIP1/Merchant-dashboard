"use client";

import React, { useCallback } from "react";
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

  const handlePlaceTypeSelect = useCallback(
    (value: string) => {
      setValue(
        "placeType",
        //@ts-expect-error: TS not able to infer correctly here
        value,
        {
          shouldValidate: true,
          shouldDirty: true,
        },
      );
    },
    [setValue],
  );

  return (
    <div className="space-y-5">
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
            <button
              key={type.value}
              type="button"
              onClick={() => handlePlaceTypeSelect(type.value)}
              aria-pressed={placeType === type.value}
              className={cn(
                "flex min-h-[36px] items-center gap-x-1.5 rounded-full border px-3 text-xs font-semibold transition-colors",
                placeType === type.value
                  ? "brand-gradient border-transparent text-white shadow-md shadow-primary/25"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              <HugeiconsIcon icon={type.icon} size={16} />
              <span>{type.label}</span>
            </button>
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

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
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
        description="Press Enter to add more emails."
      />

      <FormArrayInput
        control={control}
        name="phoneNumbers"
        label="Contact Phone Numbers"
        placeholder="Add Phone Number"
        type="tel"
        description="Press Enter to add more phone numbers"
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
