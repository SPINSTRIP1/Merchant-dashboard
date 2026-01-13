"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Event, eventSchema } from "../_schemas";
import toast from "react-hot-toast";
import { z } from "zod";
import { DEFAULT_EVENT_VALUES } from "../_constants";
import api from "@/lib/api/axios-client";
import { SERVER_URL } from "@/constants";
import { useQueryClient } from "@tanstack/react-query";
import { handleAxiosError } from "@/lib/api/handle-axios-error";
import { AxiosError } from "axios";
import { ActionType } from "@/app/(dashboard)/_types";
import { mergeDateTime } from "../_utils";
import { useServerPagination } from "@/hooks/use-server-pagination";

interface EventsContextType {
  form: ReturnType<typeof useForm<Event>>;
  loading: boolean;
  handleFieldChange: (fieldName: string, value: unknown) => void;
  submitEvent: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  debouncedSearch: string;
  statusFilter: string;
  setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
  action: ActionType;
  setAction: React.Dispatch<React.SetStateAction<ActionType>>;
  handleReset: () => void;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const form = useForm<Event>({
    resolver: zodResolver(eventSchema),
    mode: "onChange",
    defaultValues: DEFAULT_EVENT_VALUES as Event,
  });
  const [action, setAction] = useState<ActionType>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const { getValues, setValue, reset, trigger } = form;
  const queryClient = useQueryClient();

  const { refetch } = useServerPagination<Event>({
    queryKey: "events",
    endpoint: `${SERVER_URL}/events`,
    searchQuery: debouncedSearch,
    filters: {
      status: statusFilter,
      sortBy,
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);
  // Function to trigger validation on field change
  const handleFieldChange = useCallback(
    (fieldName: string, value: unknown) => {
      setValue(fieldName as keyof Event, value as never, {
        shouldValidate: true,
      });
    },
    [setValue]
  );
  const handleReset = useCallback(() => {
    reset(DEFAULT_EVENT_VALUES as Event);
    setCurrentStep(1);
    setAction(null);
  }, [reset, setAction]);

  const submitEvent = useCallback(async () => {
    const isValid = await trigger([
      "name",
      "contactEmail",
      "contactPhone",
      "description",
      "files",
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
    const { files, startTime, endTime, ...rest } = getValues();
    if (!rest.placeId) {
      const isFilled = await trigger(["location", "city", "state", "country"]);
      if (!isFilled) {
        toast.error("Please provide a location for the event.");
        return;
      }
    }
    const payload = {
      ...rest,
      startDate: mergeDateTime(rest.startDate, startTime),
      endDate: mergeDateTime(rest.endDate, endTime),
      images: undefined, // Remove images from payload as they are handled separately
    };
    setLoading(true);
    try {
      // delete payload.images;
      const isUpdating = Boolean(payload.id);
      let res;
      if (isUpdating) {
        const { id, ...updateData } = payload;
        res = await api.patch(SERVER_URL + "/events/" + id, updateData);
      } else res = await api.post(SERVER_URL + "/events", payload);
      const { data, status, message } = res.data as {
        data: Event;
        status: string;
        message?: string;
      };
      if (status === "success") {
        if (files?.length) {
          try {
            const formData = new FormData();
            formData.append("mediaType", "images");
            files.forEach((file) => formData.append("files", file));
            await api.post(SERVER_URL + `/events/${data.id}/media`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });
          } catch (error) {
            console.log("Error uploading files:", error);
            toast.error(
              `Event ${
                isUpdating ? "updated" : "created"
              } but failed to upload images. Please try again.`
            );
          }
        }
        toast.success(
          message || `Event ${isUpdating ? "updated" : "created"} successfully!`
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
  }, [getValues, handleReset, queryClient, trigger, refetch]);

  return (
    <EventsContext.Provider
      value={{
        form,
        loading,
        handleFieldChange,
        submitEvent,
        searchQuery,
        setSearchQuery,
        debouncedSearch,
        statusFilter,
        setStatusFilter,
        sortBy,
        setSortBy,
        action,
        setAction,
        handleReset,
        currentStep,
        setCurrentStep,
      }}
    >
      <FormProvider {...form}>{children}</FormProvider>
    </EventsContext.Provider>
  );
}

export function useEventsForm() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error("useEventsForm must be used within an EventsFormProvider");
  }
  return context;
}
