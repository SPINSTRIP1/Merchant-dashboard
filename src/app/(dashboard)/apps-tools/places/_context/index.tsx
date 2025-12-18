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
import { Place, placeSchema } from "../_schemas";
import toast from "react-hot-toast";
import { z } from "zod";
import { DEFAULT_PLACES_VALUES } from "../_constants";
import api from "@/lib/api/axios-client";
import { PLACES_SERVER_URL } from "@/constants";
import { useQueryClient } from "@tanstack/react-query";
import { handleAxiosError } from "@/lib/api/handle-axios-error";
import { AxiosError } from "axios";

export type ActionType =
  | "add"
  | "edit"
  | "delete"
  | "deactivate"
  | "insights"
  | "reactivate"
  | null;
interface PlacesContextType {
  form: ReturnType<typeof useForm<Place>>;
  loading: boolean;
  handleFieldChange: (fieldName: string, value: unknown) => void;
  submitPlace: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  debouncedSearch: string;
  statusFilter: string;
  setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
  action: ActionType;
  setAction: React.Dispatch<React.SetStateAction<ActionType>>;
}

const PlacesContext = createContext<PlacesContextType | undefined>(undefined);

export function PlacesFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const form = useForm<Place>({
    resolver: zodResolver(placeSchema),
    mode: "onChange",
    defaultValues: DEFAULT_PLACES_VALUES as Place,
  });
  const [action, setAction] = useState<ActionType>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [loading, setLoading] = useState(false);
  const { getValues, setValue, reset, trigger } = form;
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);
  // Function to trigger validation on field change
  const handleFieldChange = useCallback(
    (fieldName: string, value: unknown) => {
      setValue(fieldName as keyof Place, value as never, {
        shouldValidate: true,
      });
    },
    [setValue]
  );

  const submitPlace = useCallback(async () => {
    const formData = getValues();
    delete formData.website;
    const isValid = await trigger();
    if (!isValid) {
      toast.error("Please check all form fields and try again.");
      return;
    }

    setLoading(true);
    const isUpdating = Boolean(formData.id);
    try {
      let res;
      if (isUpdating) {
        const { id, ...updateData } = formData;
        res = await api.patch(PLACES_SERVER_URL + "/places/" + id, updateData);
      } else res = await api.post(PLACES_SERVER_URL + "/places", formData);
      const { status, message } = res.data as {
        status: string;
        message?: string;
      };
      if (status === "success") {
        toast.success(
          message || `Place ${isUpdating ? "updated" : "created"} successfully!`
        );
        queryClient.invalidateQueries({ queryKey: ["places"] });
        reset(DEFAULT_PLACES_VALUES as Place);
        setAction(null);
      }
    } catch (error) {
      console.log("Error submitting Place:", error);
      if (error instanceof z.ZodError) {
        toast.error("Please check all form fields and try again.");
      } else {
        const err = handleAxiosError(error as AxiosError);
        toast.error(
          err ||
            `Failed to ${
              isUpdating ? "update" : "create"
            } Place. Please try again.`
        );
      }
    } finally {
      setLoading(false);
    }
  }, [getValues, queryClient, trigger, reset, setAction]);

  return (
    <PlacesContext.Provider
      value={{
        form,
        loading,
        handleFieldChange,
        submitPlace,
        searchQuery,
        setSearchQuery,
        debouncedSearch,
        statusFilter,
        setStatusFilter,
        sortBy,
        setSortBy,
        action,
        setAction,
      }}
    >
      <FormProvider {...form}>{children}</FormProvider>
    </PlacesContext.Provider>
  );
}

export function usePlacesForm() {
  const context = useContext(PlacesContext);
  if (context === undefined) {
    throw new Error("usePlacesForm must be used within an PlacesFormProvider");
  }
  return context;
}
