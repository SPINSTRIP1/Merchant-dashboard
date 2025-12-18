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
        <FormSelect
          control={control}
          label="Type of Place"
          name="placeType"
          placeholder="Type of Place"
          options={[
            { label: "Hotel", value: "HOTEL" },
            { label: "Short Let", value: "SHORT_LET" },
            { label: "Beach Resort", value: "BEACH_RESORT" },
            { label: "Recreation Center", value: "RECREATION_CENTER" },
            { label: "Business Hub", value: "BUSINESS_HUB" },
            { label: "Stadium", value: "STADIUM" },
            { label: "Sport Facility", value: "SPORT_FACILITY" },
            { label: "Country Club", value: "COUNTRY_CLUB" },
            { label: "Sport Recreation Club", value: "SPORT_RECREATION_CLUB" },
            { label: "Hospital", value: "HOSPITAL" },
            { label: "Clinic", value: "CLINIC" },
            { label: "Pharmacy", value: "PHARMACY" },
            { label: "Spa Wellness Center", value: "SPA_WELLNESS_CENTER" },
            { label: "Gym", value: "GYM" },
            { label: "Studio", value: "STUDIO" },
            { label: "Airport", value: "AIRPORT" },
            { label: "Rail Station", value: "RAIL_STATION" },
            { label: "Road Transport Hub", value: "ROAD_TRANSPORT_HUB" },
            { label: "Water Transport Hub", value: "WATER_TRANSPORT_HUB" },
            { label: "Religious Centre", value: "RELIGIOUS_CENTRE" },
            { label: "Police Station", value: "POLICE_STATION" },
            { label: "Court", value: "COURT" },
            { label: "Military Barracks", value: "MILITARY_BARRACKS" },
            { label: "Bank", value: "BANK" },
            { label: "Strip Club", value: "STRIP_CLUB" },
          ]}
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
            options={["Ikeja", "Port Harcourt"]}
          />
          <FormSelect
            control={control}
            label="State"
            name="state"
            placeholder="State"
            options={["Lagos", "Rivers"]}
          />
          <FormSelect
            control={control}
            label="Country"
            name="country"
            placeholder="Country"
            options={["Nigeria"]}
          />
        </div>
        <FormInput
          control={control}
          label="Closest Landmarks"
          name="landmarks"
          placeholder="Landmark"
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
          label="Upload Environmental Safety Policy"
          onFileSelect={(file) => console.log(file)}
        />
        <UploadFile
          label="Upload Security Policy "
          onFileSelect={(file) => console.log(file)}
        />
        <UploadFile
          label="Upload Disclaimers"
          onFileSelect={(file) => console.log(file)}
        />
        <UploadFile
          label="Upload Proof of Ownership (Rent/Lease Receipt or Property Document)"
          onFileSelect={(file) => console.log(file)}
        />
        <UploadFile
          label="Upload Proof of Ownership (Video)"
          type="video"
          onFileSelect={(file) => console.log(file)}
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
