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
import { SERVER_URL } from "@/constants";
import { useQueryClient } from "@tanstack/react-query";
import { handleAxiosError } from "@/lib/api/handle-axios-error";
import { AxiosError } from "axios";
import { ActionType } from "@/app/(dashboard)/_types";

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
  handleReset: () => void;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  handleNext: () => Promise<void>;
  handlePrevious: () => void;
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
  const [currentStep, setCurrentStep] = useState<number>(1);
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
  const handleReset = useCallback(() => {
    reset(DEFAULT_PLACES_VALUES as Place);
    setCurrentStep(1);
    setAction(null);
  }, [reset, setAction]);
  const submitPlace = useCallback(async () => {
    const {
      environmentalSafetyPolicy,
      privacyPolicy,
      disclaimers,
      ownershipDocument,
      ownershipVideo,
      coverImage,
      ...formData
    } = getValues();
    const isValid = await trigger([
      "name",
      "description",
      "placeType",
      "address",
      "city",
      "state",
      "country",
      "emails",
      "phoneNumbers",
      // "coverImage",
    ]);
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
        res = await api.patch(SERVER_URL + "/places/" + id, {
          name: updateData.name,
          description: updateData.description,
          address: updateData.address,
          landmarks: updateData.landmarks,
          city: updateData.city,
          state: updateData.state,
          country: updateData.country,
          longitude: updateData.longitude,
          latitude: updateData.latitude,
          placeType: updateData.placeType,
          emails: updateData.emails,
          phoneNumbers: updateData.phoneNumbers,
          website: updateData.website,
        });
      } else res = await api.post(SERVER_URL + "/places", formData);
      const { status, message, data } = res.data as {
        status: string;
        message?: string;
        data: Place;
      };
      if (status === "success") {
        try {
          const formData = new FormData();

          if (coverImage instanceof File) {
            formData.append("coverImage", coverImage);
          }
          if (environmentalSafetyPolicy instanceof File) {
            formData.append(
              "environmentalSafetyPolicy",
              environmentalSafetyPolicy
            );
          }
          if (privacyPolicy instanceof File) {
            formData.append("privacyPolicy", privacyPolicy);
          }
          if (disclaimers instanceof File) {
            formData.append("disclaimers", disclaimers);
          }
          if (ownershipDocument instanceof File) {
            formData.append("ownershipDocument", ownershipDocument);
          }
          if (ownershipVideo instanceof File) {
            formData.append("ownershipVideo", ownershipVideo);
          }
          if ([...formData.entries()].length > 0) {
            console.log("yup");
            await api.post(SERVER_URL + `/places/${data.id}/media`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });
          }
        } catch (error) {
          console.log("Error uploading files:", error);
          toast.error(
            `Place ${
              isUpdating ? "updated" : "created"
            } but failed to upload cover image and files. Please try again.`
          );
        }
      }
      toast.success(
        message || `Place ${isUpdating ? "updated" : "created"} successfully!`
      );
      queryClient.invalidateQueries({ queryKey: ["places"] });
      handleReset();
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
  }, [getValues, queryClient, trigger, handleReset]);

  const handleNext = useCallback(async () => {
    try {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        // Last step - submit the form
        await submitPlace();
      }
    } catch (error) {
      console.log(error);
    }
  }, [currentStep, submitPlace]);

  // Handle navigation to previous step
  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);
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
        handleReset,
        currentStep,
        setCurrentStep,
        handleNext,
        handlePrevious,
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
