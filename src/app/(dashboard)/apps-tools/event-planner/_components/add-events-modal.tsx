import { FormMultiSelect } from "@/components/ui/forms/form-multi-select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import SideModal from "@/app/(dashboard)/_components/side-modal";
import { useEventsForm } from "../_context";
import { FormInput } from "@/components/ui/forms/form-input";
import { useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import { FormSelect } from "@/components/ui/forms/form-select";
import { TicketTier } from "../_schemas";
import { Deal } from "../../deals/_schemas";
import { useServerPagination } from "@/hooks/use-server-pagination";
import { SERVER_URL } from "@/constants";
import { AddressAutocomplete } from "../../places/_components/address-autocomplete";
import { SinglePlace } from "../../places/_components/claim-places-steps/find-place";
import { PlaceAutocomplete } from "./place-autocomplete";

// Local imports
import {
  MAX_IMAGES,
  FREQUENCY_OPTIONS,
  RECURRENCE_OPTIONS,
  TIMEZONE_OPTIONS,
  FEATURED_OPTIONS,
} from "../_constants/event-modal";
import { MediaImage } from "./media-image";
import { ImageUploadField } from "./image-upload-field";
import { TicketRow } from "./ticket-row";
import { TicketInputRow } from "./ticket-input-row";
import { useImageUpload } from "../_hooks/use-image-upload";
import { useTicketInput } from "../_hooks/use-ticket-input";

// Props type
interface AddEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  action?: "edit" | "add" | null;
}

export default function AddEventsModal({
  isOpen,
  onClose,
  action = "add",
}: AddEventsModalProps) {
  const {
    form: {
      control,
      watch,
      setValue,
      formState: { errors },
    },
    handleFieldChange,
    loading,
    submitEvent,
  } = useEventsForm();

  // Watch form values
  const files = watch("files") || [];
  const media = watch("images") || [];
  const tickets = watch("ticketTiers") || [];
  const placeId = watch("placeId") || "";
  const frequency = watch("frequency");
  const recurringPattern = watch("recurringPattern");

  // Custom hooks
  const {
    imageUploadFields,
    handleFileSelect,
    addImageUploadField,
    removeImageUploadField,
    removeMediaImage,
    resetFields,
  } = useImageUpload(files, media, handleFieldChange);

  const handleAddTicket = useCallback(
    (newTickets: TicketTier[]) => setValue("ticketTiers", newTickets),
    [setValue]
  );

  const { ticketInput, handleInputChange, addTicket, resetInput } =
    useTicketInput(tickets, handleAddTicket);

  // Server data
  const { items: deals, isLoading: isDealsLoading } = useServerPagination<Deal>(
    {
      queryKey: "deals",
      endpoint: `${SERVER_URL}/deals`,
    }
  );

  // Memoized options
  const dealOptions = useMemo(
    () => deals?.map((deal) => ({ label: deal.name, value: deal.id! })) || [],
    [deals]
  );

  // Handlers
  const handleClose = useCallback(() => {
    resetFields();
    resetInput();
    onClose();
  }, [onClose, resetFields, resetInput]);

  const handlePlaceSelect = useCallback(
    (place: SinglePlace) => {
      if (place) {
        setValue("location", place.address || "");
        setValue("city", place.city || "");
        setValue("state", place.state || "");
        setValue("country", place.country || "");
      }
    },
    [setValue]
  );

  // Derived state
  const canAddMoreImages = imageUploadFields.length < MAX_IMAGES;
  const showLocationFields = !placeId;
  const showRecurrencePattern = frequency === "RECURRING";
  const showCustomRecurrence =
    showRecurrencePattern && recurringPattern === "CUSTOM";
  const submitButtonText =
    action === "add"
      ? loading
        ? "Adding..."
        : "Add Event"
      : loading
      ? "Updating..."
      : "Update Event";

  return (
    <SideModal isOpen={isOpen} onClose={handleClose}>
      <div className="space-y-7 pt-16 pb-5">
        {/* Event Basic Info */}
        <FormInput
          control={control}
          name="name"
          label="Event Name"
          placeholder="Enter Event Name"
        />
        <FormInput
          control={control}
          name="description"
          label="Event Description"
          placeholder="Enter description"
          type="textarea"
        />

        {/* Place Selection */}
        <PlaceAutocomplete
          control={control}
          name="placeId"
          label="Add a place"
          placeholder="Search for a place"
          onSelect={handlePlaceSelect}
        />

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-5">
          <FormInput
            control={control}
            name="contactPhone"
            label="Contact Phone"
            placeholder="e.g. 08102345060"
          />
          <FormInput
            control={control}
            name="contactEmail"
            label="Contact Email"
            placeholder="e.g. johndoe@example.com"
          />
        </div>

        {/* Location Fields (shown when no place selected) */}
        {showLocationFields && (
          <>
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
              name="location"
              label="Address"
              placeholder="Enter Street Name and Number"
            />
          </>
        )}

        {/* Media Upload Section */}
        <div className="space-y-3 w-full">
          <Label>Upload Event Media</Label>
          <div className="flex gap-4 flex-wrap mb-4">
            {media.map((imageUrl, index) => (
              <MediaImage
                key={`media-${index}`}
                imageUrl={imageUrl}
                index={index}
                id={watch("id") || ""}
                onRemove={removeMediaImage}
              />
            ))}
            {imageUploadFields.map((fieldId, index) => (
              <ImageUploadField
                key={fieldId}
                fieldId={fieldId}
                index={index}
                file={files[index]}
                canRemove={imageUploadFields.length > 1}
                onFileSelect={handleFileSelect}
                onRemove={removeImageUploadField}
              />
            ))}
          </div>
          {errors.files && (
            <p className="text-sm text-red-600">
              {errors.files.message as string}
            </p>
          )}
          <div className="flex items-center justify-center flex-col pt-2">
            <p className="text-sm text-gray-600">
              Click to upload or drag and drop images
            </p>
            <span className="text-[9px] font-semibold text-gray-500">
              JPG, JPEG, PNG, WEBP formats supported (Max 10MB per image)
            </span>
          </div>
          {canAddMoreImages && (
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

        {/* Event Frequency */}
        <FormMultiSelect
          control={control}
          name="frequency"
          label="Event Frequency"
          options={FREQUENCY_OPTIONS}
          className="lg:grid"
          radioClassName="lg:w-full"
        />
        {showRecurrencePattern && (
          <FormMultiSelect
            control={control}
            name="recurringPattern"
            label="Recurrence Pattern"
            options={RECURRENCE_OPTIONS}
            radioClassName="lg:max-w-[140px]"
          />
        )}
        {showCustomRecurrence && (
          <FormInput
            control={control}
            name="customRecurrenceDays"
            label="Custom Recurrence (Days)"
            placeholder="Enter number of days"
            type="number"
          />
        )}

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-5">
          <FormInput
            control={control}
            type="date"
            name="startDate"
            label="Start Date"
          />
          <FormInput
            control={control}
            type="date"
            name="endDate"
            label="End Date"
          />
        </div>
        <div className="grid grid-cols-3 gap-5">
          <FormInput
            control={control}
            type="time"
            name="startTime"
            label="Start Time"
          />
          <FormInput
            control={control}
            type="time"
            name="endTime"
            label="End Time"
          />
          <FormSelect
            control={control}
            name="timezone"
            label="Timezone"
            options={TIMEZONE_OPTIONS}
            placeholder="Select Timezone"
          />
        </div>

        {/* Tickets Section */}
        <div>
          <Label>Tickets</Label>
          {tickets.map((ticket, index) => (
            <TicketRow key={`ticket-${index}`} ticket={ticket} />
          ))}
          <TicketInputRow
            ticketInput={ticketInput}
            onInputChange={handleInputChange}
            onAdd={addTicket}
          />
          <p className="text-center mt-4">
            Click on the + icon to add a new ticket tier.
          </p>
        </div>

        {/* Guest Settings */}
        <div className="grid grid-cols-2 gap-5">
          <FormInput
            control={control}
            name="expectedGuests"
            label="Expected Guests"
            placeholder="1000 Guests"
            type="number"
          />
          <FormInput
            control={control}
            name="soldOutThreshold"
            label="Sold Out Threshold"
            placeholder="500 Tickets"
            type="number"
          />
        </div>

        {/* Featured and Deal */}
        <FormMultiSelect
          control={control}
          name="isFeatured"
          label="Mark as Featured"
          options={FEATURED_OPTIONS}
          valueType="boolean"
          className="lg:grid"
          radioClassName="lg:w-full"
        />
        <FormSelect
          label="Add to Deal"
          control={control}
          name="dealId"
          options={dealOptions}
          placeholder="Add to Deal"
          disabled={isDealsLoading}
        />

        {/* Action Buttons */}
        <div className="flex mt-6 gap-x-3 items-center">
          <Button
            variant="secondary"
            className="w-full h-[51px] py-3"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            disabled={loading}
            className="w-full h-[51px] py-3"
            onClick={submitEvent}
          >
            {submitButtonText}
          </Button>
        </div>
      </div>
    </SideModal>
  );
}
