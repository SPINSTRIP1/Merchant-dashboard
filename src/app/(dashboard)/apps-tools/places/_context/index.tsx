"use client";

import React, { useCallback, useMemo, useContext, createContext } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

import { Place, placeSchema } from "../_schemas";
import { DEFAULT_PLACES_VALUES } from "../_constants";
import {
  createFormContext,
  BaseFormContextType,
} from "@/lib/create-form-context";
import api from "@/lib/api/axios-client";
import { SERVER_URL } from "@/constants";
import { handleAxiosError } from "@/lib/api/handle-axios-error";
import { AxiosError } from "axios";
import { flushPendingArrayInputs } from "@/components/ui/forms/form-array-input";
import { uploadNamedFiles } from "@/lib/upload-files";

// Steps for places form
const PLACES_STEPS = ["Basic Info", "Location", "Operating Hours", "Documents"];

// ============================================================================
// Extended Context Type (for places-specific properties)
// ============================================================================

interface PlacesContextType extends BaseFormContextType<Place> {
  submitPlace: () => Promise<void>;
  handleReset: () => void;
}

// ============================================================================
// Create Base Context Using Factory
// ============================================================================

const { Provider: BasePlacesProvider, useFormContext: useBasePlacesForm } =
  createFormContext<Place>({
    name: "Places",
    schema: placeSchema,
    defaultValues: DEFAULT_PLACES_VALUES as Place,
    steps: PLACES_STEPS,
    queryKeys: ["places"],
  });

// ============================================================================
// Extended Provider (with places-specific submit logic)
// ============================================================================

const PlacesContext = createContext<PlacesContextType | undefined>(undefined);

export function PlacesFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BasePlacesProvider>
      <PlacesExtendedProvider>{children}</PlacesExtendedProvider>
    </BasePlacesProvider>
  );
}

function PlacesExtendedProvider({ children }: { children: React.ReactNode }) {
  const baseContext = useBasePlacesForm();
  const { form, setLoading, resetForm, setAction } = baseContext;
  const queryClient = useQueryClient();

  // Reset handler that also resets to step 1
  const handleReset = useCallback(() => {
    resetForm();
    baseContext.setCurrentStep(1);
    setAction(null);
  }, [resetForm, baseContext, setAction]);

  // Submit Place data (places-specific logic with file uploads)
  const submitPlace = useCallback(async () => {
    const {
      environmentalSafetyPolicy,
      privacyPolicy,
      disclaimers,
      ownershipDocument,
      ownershipVideo,
      coverImage,
      ...formData
    } = form.getValues();

    const isValid = await form.trigger([
      "name",
      "description",
      "placeType",
      "address",
      "city",
      "state",
      "country",
      "emails",
      "phoneNumbers",
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
      } else {
        res = await api.post(SERVER_URL + "/places", formData);
      }

      const { status, message, data } = res.data as {
        status: string;
        message?: string;
        data: Place;
      };

      if (status === "success") {
        await uploadNamedFiles({
          files: {
            coverImage,
            environmentalSafetyPolicy,
            privacyPolicy,
            disclaimers,
            ownershipDocument,
            ownershipVideo,
          },
          endpoint: `${SERVER_URL}/places/${data.id}/media`,
          entityName: "Place",
          isUpdating,
        });
      }
      toast.success(
        message || `Place ${isUpdating ? "updated" : "created"} successfully!`,
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
            } Place. Please try again.`,
        );
      }
    } finally {
      setLoading(false);
    }
  }, [form, setLoading, queryClient, handleReset]);

  // Override handleNext to use submitPlace on last step
  const handleNext = useCallback(async () => {
    const { currentStep, steps, setCurrentStep } = baseContext;

    // Flush any pending array inputs before navigation
    flushPendingArrayInputs();

    try {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        // Last step - submit the form
        await submitPlace();
      }
    } catch (error) {
      console.log("Error in places handleNext:", error);
    }
  }, [baseContext, submitPlace]);

  const extendedContext = useMemo<PlacesContextType>(
    () => ({
      ...baseContext,
      handleNext,
      submitPlace,
      handleReset,
    }),
    [baseContext, handleNext, submitPlace, handleReset],
  );

  return (
    <PlacesContext.Provider value={extendedContext}>
      {children}
    </PlacesContext.Provider>
  );
}

// ============================================================================
// Hook Export (maintains backward compatibility)
// ============================================================================

export function usePlacesForm(): PlacesContextType {
  const context = useContext(PlacesContext);
  if (context === undefined) {
    throw new Error("usePlacesForm must be used within a PlacesFormProvider");
  }
  return context;
}
