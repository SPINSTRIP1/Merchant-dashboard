"use client";

import React, { useCallback, useMemo, useContext, createContext } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

import { Event, eventSchema } from "../_schemas";
import { DEFAULT_EVENT_VALUES } from "../_constants";
import {
  createFormContext,
  BaseFormContextType,
} from "@/lib/create-form-context";
import api from "@/lib/api/axios-client";
import { SERVER_URL } from "@/constants";
import { handleAxiosError } from "@/lib/api/handle-axios-error";
import { AxiosError } from "axios";
import { mergeDateTime } from "../_utils";
import { useServerPagination } from "@/hooks/use-server-pagination";
import { flushPendingArrayInputs } from "@/components/ui/forms/form-array-input";
import { flushPendingTicketInputs } from "../_hooks/use-ticket-input";

// ============================================================================
// Extended Context Type (for events-specific properties)
// ============================================================================

interface EventsContextType extends BaseFormContextType<Event> {
  submitEvent: () => Promise<void>;
  handleReset: () => void;
}

// ============================================================================
// Create Base Context Using Factory
// ============================================================================

const { Provider: BaseEventsProvider, useFormContext: useBaseEventsForm } =
  createFormContext<Event>({
    name: "Events",
    schema: eventSchema,
    defaultValues: DEFAULT_EVENT_VALUES as Event,
    steps: ["Event Details"], // Single step since events doesn't use multi-step
    queryKeys: ["events", "events-stats"],
  });

// ============================================================================
// Extended Provider (with events-specific submit logic)
// ============================================================================

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BaseEventsProvider>
      <EventsExtendedProvider>{children}</EventsExtendedProvider>
    </BaseEventsProvider>
  );
}

function EventsExtendedProvider({ children }: { children: React.ReactNode }) {
  const baseContext = useBaseEventsForm();
  const {
    form,
    setLoading,
    resetForm,
    setAction,
    debouncedSearch,
    statusFilter,
    sortBy,
    action,
  } = baseContext;
  const queryClient = useQueryClient();

  // Use server pagination for events list
  const { refetch } = useServerPagination<Event>({
    queryKey: "events",
    endpoint: `${SERVER_URL}/events`,
    searchQuery: debouncedSearch,
    filters: {
      status: statusFilter,
      sortBy,
    },
  });

  // Reset handler that also resets to step 1
  const handleReset = useCallback(() => {
    resetForm();
    baseContext.setCurrentStep(1);
    setAction(null);
  }, [resetForm, baseContext, setAction]);

  // Submit Event data (events-specific logic with validation)
  const submitEvent = useCallback(async () => {
    // Flush any pending array inputs before submitting
    flushPendingArrayInputs();
    // Flush any pending ticket inputs before submitting
    flushPendingTicketInputs();

    const isValid = await form.trigger([
      "name",
      "contactEmail",
      "contactPhone",
      "description",
      "startDate",
      "endDate",
      "startTime",
      "endTime",
      "timezone",
      "frequency",
      "expectedGuests",
      "soldOutThreshold",
    ]);
    if (!isValid) {
      toast.error("Please check all form fields and try again.");
      return;
    }

    const mediaUploaded = await form.trigger("files");
    if (action === "add" && !mediaUploaded) {
      toast.error("Please upload at least one image for the event.");
      return;
    }

    const { files, startTime, endTime, ...rest } = form.getValues();
    if (!rest.placeId) {
      const isFilled = await form.trigger([
        "location",
        "city",
        "state",
        "country",
      ]);
      if (!isFilled) {
        toast.error("Please provide a location for the event.");
        return;
      }
    }

    const payload = {
      ...rest,
      dealId: rest.dealId === "None" ? undefined : rest.dealId,
      startDate: mergeDateTime(rest.startDate, startTime),
      endDate: mergeDateTime(rest.endDate, endTime),
      images: undefined, // Remove images from payload as they are handled separately
    };

    setLoading(true);
    try {
      const isUpdating = Boolean(payload.id);
      let res;
      if (isUpdating) {
        const { id, ...updateData } = payload;
        res = await api.patch(SERVER_URL + "/events/" + id, updateData);
      } else {
        res = await api.post(SERVER_URL + "/events", payload);
      }

      const { data, status, message } = res.data as {
        data: Event;
        status: string;
        message?: string;
      };

      if (status === "success") {
        if (files?.length) {
          try {
            const formDataObj = new FormData();
            formDataObj.append("mediaType", "images");
            files.forEach((file) => formDataObj.append("files", file));
            await api.post(
              SERVER_URL + `/events/${data.id}/media`,
              formDataObj,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              },
            );
          } catch (error) {
            console.log("Error uploading files:", error);
            toast.error(
              `Event ${
                isUpdating ? "updated" : "created"
              } but failed to upload images. Please try again.`,
            );
          }
        }
        toast.success(
          message ||
            `Event ${isUpdating ? "updated" : "created"} successfully!`,
        );
        handleReset();
        await refetch();
        queryClient.invalidateQueries({ queryKey: ["events-stats"] });
      }
    } catch (error) {
      console.log("Error submitting event:", error);
      const err = handleAxiosError(error as AxiosError);
      if (error instanceof z.ZodError) {
        toast.error("Please check all form fields and try again.");
      } else {
        toast.error(err || "Failed to create event. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [form, setLoading, handleReset, queryClient, refetch]);

  const extendedContext = useMemo<EventsContextType>(
    () => ({
      ...baseContext,
      submitEvent,
      handleReset,
    }),
    [baseContext, submitEvent, handleReset],
  );

  return (
    <EventsContext.Provider value={extendedContext}>
      {children}
    </EventsContext.Provider>
  );
}

// ============================================================================
// Hook Export (maintains backward compatibility)
// ============================================================================

export function useEventsForm(): EventsContextType {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error("useEventsForm must be used within an EventsFormProvider");
  }
  return context;
}
