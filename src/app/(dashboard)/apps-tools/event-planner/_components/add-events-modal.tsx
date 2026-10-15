import { FormMultiSelect } from "@/components/ui/forms/form-multi-select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
    [setValue],
  );

  const { ticketInput, handleInputChange, addTicket, resetInput } =
    useTicketInput(tickets, handleAddTicket);

  // Server data
  const { items: deals, isLoading: isDealsLoading } = useServerPagination<Deal>(
    {
      queryKey: "deals",
      endpoint: `${SERVER_URL}/deals`,
    },
  );

  // Memoized options
  const dealOptions = useMemo(
    () =>
      deals
        ?.filter((deal) => deal.status === "ACTIVE" || deal.id === watch("dealId"))
        .map((deal) => ({
          label: `${deal.name} — ${deal.discountPercentage}% off`,
          value: deal.id!,
        })) || [],
    [deals, watch],
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
        setValue("placeId", place.id || "None");
      }
    },
    [setValue],
  );

  // Derived state
  const canAddMoreImages = imageUploadFields.length < MAX_IMAGES;
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

  const updateTicket = (index: number, patch: Partial<TicketTier>) =>
    setValue(
      "ticketTiers",
      tickets.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    );
  const removeTicket = (index: number) =>
    setValue(
      "ticketTiers",
      tickets.filter((_, i) => i !== index),
    );
  const linkedLocation = [watch("location"), watch("city"), watch("state"), watch("country")]
    .filter(Boolean)
    .join(", ");

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{action === "edit" ? "Edit Event" : "Create Event"}</SheetTitle>
          <SheetDescription>
            Events are published on your public event page, where guests can buy tickets.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 pb-2">
          <FormInput
            control={control}
            name="name"
            label="Event Name"
            placeholder="e.g. Independence Day"
          />
          <FormInput
            control={control}
            name="description"
            label="Event Description"
            placeholder="What is this event about?"
            type="textarea"
          />

          <PlaceAutocomplete
            control={control}
            name="placeId"
            label="Add a place"
            placeholder="Search for a place"
            onSelect={handlePlaceSelect}
          />
          {placeId && linkedLocation && (
            <p className="-mt-3 rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              Location: {linkedLocation}
            </p>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormInput
              control={control}
              name="contactPhone"
              label="Contact Phone"
              placeholder="0810 000 0000"
            />
            <FormInput
              control={control}
              name="contactEmail"
              label="Contact Email"
              placeholder="you@business.com"
            />
          </div>

          {!placeId && (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <FormInput control={control} label="City" name="city" placeholder="Lagos" />
                <FormInput control={control} label="State" name="state" placeholder="Lagos" />
                <FormInput control={control} label="Country" name="country" placeholder="Nigeria" />
              </div>
              <AddressAutocomplete
                control={control}
                name="location"
                label="Address"
                placeholder="Venue street address"
              />
            </>
          )}

          <div className="space-y-3">
            <Label>Upload Event Media</Label>
            <p className="text-xs text-muted-foreground">
              The first image is used as the thumbnail. JPG, JPEG, PNG or WEBP, up to 10MB each.
            </p>
            <div className="flex flex-wrap gap-4">
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
              <p className="text-xs font-medium text-destructive">{errors.files.message as string}</p>
            )}
            {canAddMoreImages && (
              <Button type="button" onClick={addImageUploadField} variant="soft" size="sm">
                <Plus /> Add Another Image
              </Button>
            )}
          </div>

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

          <div className="grid grid-cols-2 gap-3">
            <FormInput control={control} type="date" name="startDate" label="Start Date" />
            <FormInput control={control} type="date" name="endDate" label="End Date" />
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <FormInput control={control} type="time" name="startTime" label="Start Time" />
            <FormInput control={control} type="time" name="endTime" label="End Time" />
            <div className="col-span-2 md:col-span-1">
              <FormSelect
                control={control}
                name="timezone"
                label="Timezone"
                options={TIMEZONE_OPTIONS}
                placeholder="Select Timezone"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tickets</Label>
            {tickets.map((ticket, index) => (
              <TicketRow
                key={`ticket-${index}`}
                ticket={ticket}
                onChange={(patch) => updateTicket(index, patch)}
                onRemove={() => removeTicket(index)}
              />
            ))}
            <TicketInputRow
              ticketInput={ticketInput}
              onInputChange={handleInputChange}
              onAdd={addTicket}
            />
            <p className="text-xs text-muted-foreground">
              Fill in a tier and tap + to add it. Leave tickets empty for a free event.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              control={control}
              name="expectedGuests"
              label="Expected Guests"
              placeholder="1000"
              type="number"
            />
            <FormInput
              control={control}
              name="soldOutThreshold"
              label="Sold Out Threshold"
              placeholder="500"
              type="number"
            />
          </div>

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
            options={[{ label: "None", value: "None" }, ...dealOptions]}
            placeholder="Add to Deal"
            disabled={isDealsLoading}
          />
        </div>

        <div className="flex items-center justify-between gap-3 border-t pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="brand" disabled={loading} onClick={submitEvent}>
            {submitButtonText}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
