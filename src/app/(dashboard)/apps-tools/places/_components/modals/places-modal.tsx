import { Button } from "@/components/ui/button";
import { usePlacesForm } from "../../_context";
import { FormInput } from "@/components/ui/forms/form-input";
import SideModal from "@/app/(dashboard)/_components/side-modal";
import { FormSelect } from "@/components/ui/forms/form-select";
import { FormArrayInput } from "@/components/ui/forms/form-array-input";
import { UploadFile } from "../upload-file";
import { FormUploadImage } from "@/components/ui/forms/form-upload-image";
import { AddressAutocomplete } from "../address-autocomplete";
import { PLACE_TYPES } from "../../_constants";
import { ActionType } from "@/app/(dashboard)/_types";

export default function PlacesModal({
  isOpen,
  onClose,
  action = "add",
}: {
  isOpen: boolean;
  onClose: () => void;
  action?: ActionType;
}) {
  const {
    submitPlace,
    loading,
    form: { control, setValue },
  } = usePlacesForm();

  const getButtonLabel = () => {
    if (loading) {
      return action === "edit" ? "Updating..." : "Submitting...";
    }

    return action === "edit" ? "Update" : "Publish";
  };

  return (
    <SideModal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-7 pt-16 pb-5">
        <FormInput
          control={control}
          label="Name of Place"
          name="name"
          placeholder="Enter Name of Place"
        />
        <FormSelect
          control={control}
          label="Type of Place"
          name="placeType"
          placeholder="Type of Place"
          options={PLACE_TYPES}
        />

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
          label="Website"
          name="website"
          placeholder="Enter Website URL"
        />
        <UploadFile
          control={control}
          name="environmentalSafetyPolicy"
          label="Upload Environmental Safety Policy"
        />
        <UploadFile
          control={control}
          name="privacyPolicy"
          label="Upload Privacy Policy"
        />
        <UploadFile
          control={control}
          name="disclaimers"
          label="Upload Disclaimers"
        />
        <UploadFile
          control={control}
          name="ownershipDocument"
          label="Upload Proof of Ownership (Rent/Lease Receipt or Property Document)"
        />
        <UploadFile
          control={control}
          name="ownershipVideo"
          label="Upload Proof of Ownership (Video)"
          type="video"
        />

        <div className="flex justify-center mt-6 gap-x-3 items-center">
          <Button
            className="w-[368px] h-[51px] py-3"
            disabled={loading}
            onClick={submitPlace}
          >
            {getButtonLabel()}
          </Button>
        </div>
      </div>
    </SideModal>
  );
}
