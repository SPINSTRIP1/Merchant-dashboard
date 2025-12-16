import { Button } from "@/components/ui/button";
import { usePlacesForm } from "../../_context";
import { FormInput } from "@/components/ui/forms/form-input";
import SideModal from "@/app/(dashboard)/_components/side-modal";
import { FormSelect } from "@/components/ui/forms/form-select";
import { FormArrayInput } from "@/components/ui/forms/form-array-input";
import UploadFile from "../upload-file";

export default function PlacesModal({
  isOpen,
  onClose,
  action = "add",
}: {
  isOpen: boolean;
  onClose: () => void;
  action?: "edit" | "add" | null;
}) {
  const {
    submitPlace,
    loading,
    form: { control },
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

        <FormInput
          control={control}
          label="Description"
          name="description"
          placeholder="Describe the Place"
          type="textarea"
        />
        <FormInput
          control={control}
          label="Address"
          name="address"
          placeholder="Enter Street Name and Number"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          <FormSelect
            control={control}
            label="City"
            name="city"
            placeholder="City"
            options={[]}
          />
          <FormSelect
            control={control}
            label="State"
            name="state"
            placeholder="State"
            options={[]}
          />
          <FormSelect
            control={control}
            label="Country"
            name="country"
            placeholder="Country"
            options={[]}
          />
        </div>
        <FormInput
          control={control}
          label="Closest Landmarks"
          name="landmarks"
          placeholder="Landmark"
        />
        <FormInput
          control={control}
          label="Address"
          name="address"
          placeholder="Enter Street Name and Number"
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
          label="Phone Numbers"
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
        <UploadFile label="Upload Environmental Safety Policy" />
        <UploadFile label="Upload Security Policy " />
        <UploadFile label="Upload Disclaimers" />
        <UploadFile label="Upload Proof of Ownership (Rent/Lease Receipt or Property Document)" />
        <UploadFile label="Upload Proof of Ownership (Video)" type="video" />

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
