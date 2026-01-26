"use client";

import React, { useCallback, useMemo, useContext, createContext } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

import { Deal, dealSchema } from "../_schemas";
import { DEFAULT_DEALS_VALUES } from "../_constants";
import {
  createFormContext,
  BaseFormContextType,
} from "@/lib/create-form-context";
import api from "@/lib/api/axios-client";
import { SERVER_URL } from "@/constants";
import { handleAxiosError } from "@/lib/api/handle-axios-error";
import { AxiosError } from "axios";

// ============================================================================
// Extended Context Type (for deals-specific properties)
// ============================================================================

interface DealsContextType extends BaseFormContextType<Deal> {
  submitDeal: () => Promise<void>;
}

// ============================================================================
// Create Base Context Using Factory
// ============================================================================

const { Provider: BaseDealsProvider, useFormContext: useBaseDealsForm } =
  createFormContext<Deal>({
    name: "Deals",
    schema: dealSchema,
    defaultValues: DEFAULT_DEALS_VALUES as Deal,
    steps: ["Deal Details"], // Single step
    queryKeys: ["deals", "deals-stats"],
  });

// ============================================================================
// Extended Provider (with deals-specific submit logic)
// ============================================================================

const DealsContext = createContext<DealsContextType | undefined>(undefined);

export function DealsFormProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseDealsProvider>
      <DealsExtendedProvider>{children}</DealsExtendedProvider>
    </BaseDealsProvider>
  );
}

function DealsExtendedProvider({ children }: { children: React.ReactNode }) {
  const baseContext = useBaseDealsForm();
  const { form, setLoading, resetForm, setAction } = baseContext;
  const queryClient = useQueryClient();

  // Submit Deal data (deals-specific logic with date validation)
  const submitDeal = useCallback(async () => {
    const formData = form.getValues();
    const isValid = await form.trigger([
      "name",
      "description",
      "discountPercentage",
      "maximumThreshold",
      "startDate",
      "endDate",
      "campaignId",
    ]);
    if (!isValid) {
      toast.error("Please check all form fields and try again.");
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (start >= end) {
      toast.error("End date must be after start date.");
      return;
    }

    setLoading(true);
    const isUpdating = Boolean(formData.id);
    try {
      let res;
      if (isUpdating) {
        const { id, ...updateData } = formData;
        res = await api.patch(SERVER_URL + "/deals/" + id, updateData);
      } else {
        res = await api.post(SERVER_URL + "/deals", formData);
      }

      const { status, message } = res.data as {
        status: string;
        message?: string;
      };

      if (status === "success") {
        toast.success(
          message || `Deal ${isUpdating ? "updated" : "created"} successfully!`,
        );
        resetForm();
        setAction(null);
        queryClient.invalidateQueries({ queryKey: ["deals-stats"] });
        queryClient.invalidateQueries({ queryKey: ["deals"] });
      }
    } catch (error) {
      console.log("Error submitting deal:", error);
      if (error instanceof z.ZodError) {
        toast.error("Please check all form fields and try again.");
      } else {
        const err = handleAxiosError(error as AxiosError);
        toast.error(
          err ||
            `Failed to ${
              isUpdating ? "update" : "create"
            } deal. Please try again.`,
        );
      }
    } finally {
      setLoading(false);
    }
  }, [form, setLoading, resetForm, setAction, queryClient]);

  const extendedContext = useMemo<DealsContextType>(
    () => ({
      ...baseContext,
      submitDeal,
    }),
    [baseContext, submitDeal],
  );

  return (
    <DealsContext.Provider value={extendedContext}>
      {children}
    </DealsContext.Provider>
  );
}

// ============================================================================
// Hook Export (maintains backward compatibility)
// ============================================================================

export function useDealsForm(): DealsContextType {
  const context = useContext(DealsContext);
  if (context === undefined) {
    throw new Error("useDealsForm must be used within a DealsFormProvider");
  }
  return context;
}
