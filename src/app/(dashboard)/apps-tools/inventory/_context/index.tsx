"use client";

import React, { useCallback, useMemo, useContext, createContext } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

import { InventoryProduct, inventoryProductSchema } from "../_schemas";
import { DEFAULT_INVENTORY_VALUES, addInventorySteps } from "../_constants";
import {
  createFormContext,
  BaseFormContextType,
} from "@/lib/create-form-context";
import api from "@/lib/api/axios-client";
import { SERVER_URL } from "@/constants";
import { flushPendingArrayInputs } from "@/components/ui/forms/form-array-input";
import { uploadFiles } from "@/lib/upload-files";

// ============================================================================
// Extended Context Type (for inventory-specific properties)
// ============================================================================

interface InventoryContextType extends BaseFormContextType<InventoryProduct> {
  submitProduct: () => Promise<void>;
}

// ============================================================================
// Create Base Context Using Factory
// ============================================================================

const {
  Provider: BaseInventoryProvider,
  useFormContext: useBaseInventoryForm,
} = createFormContext<InventoryProduct>({
  name: "Inventory",
  schema: inventoryProductSchema,
  defaultValues: DEFAULT_INVENTORY_VALUES as InventoryProduct,
  steps: addInventorySteps,
  queryKeys: ["inventory-products", "inventory-stats"],
});

// ============================================================================
// Extended Provider (with inventory-specific submit logic)
// ============================================================================

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined,
);

export function InventoryFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BaseInventoryProvider>
      <InventoryExtendedProvider>{children}</InventoryExtendedProvider>
    </BaseInventoryProvider>
  );
}

function InventoryExtendedProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseContext = useBaseInventoryForm();
  const { form, setLoading, resetForm, setAction } = baseContext;
  const queryClient = useQueryClient();

  // Submit product data (inventory-specific logic)
  const submitProduct = useCallback(async () => {
    setLoading(true);
    try {
      const { files, ...formData } = form.getValues();
      delete formData.media;
      const isUpdating = Boolean(formData.id);
      let res;
      if (isUpdating) {
        const { id, ...updateData } = formData;
        res = await api.patch(
          SERVER_URL + "/inventory/products/" + id,
          updateData,
        );
      } else {
        res = await api.post(SERVER_URL + "/inventory/products", formData);
      }

      const { data, status, message } = res.data as {
        data: InventoryProduct;
        status: string;
        message?: string;
      };

      if (status === "success") {
        if (files?.length) {
          await uploadFiles({
            files,
            endpoint: `${SERVER_URL}/inventory/products/${data.id}/images`,
            entityName: "Product",
            isUpdating,
          });
        }
        toast.success(
          message ||
            `Product ${isUpdating ? "updated" : "created"} successfully!`,
        );
        resetForm();
        setAction(null);
        queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-products"] });
      }
    } catch (error) {
      console.log("Error submitting product:", error);
      if (error instanceof z.ZodError) {
        toast.error("Please check all form fields and try again.");
      } else {
        toast.error("Failed to create product. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [form, setLoading, resetForm, setAction, queryClient]);

  // Override handleNext to use submitProduct on last step and flush array inputs
  const handleNext = useCallback(async () => {
    const { currentStep, steps, setCurrentStep } = baseContext;

    // Flush any pending array inputs before navigation
    flushPendingArrayInputs();

    try {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        // Last step - submit the form
        await submitProduct();
      }
    } catch (error) {
      console.log("Error in inventory handleNext:", error);
    }
  }, [baseContext, submitProduct]);

  const extendedContext = useMemo<InventoryContextType>(
    () => ({
      ...baseContext,
      handleNext,
      submitProduct,
    }),
    [baseContext, handleNext, submitProduct],
  );

  return (
    <InventoryContext.Provider value={extendedContext}>
      {children}
    </InventoryContext.Provider>
  );
}

// ============================================================================
// Hook Export (maintains backward compatibility)
// ============================================================================

export function useInventoryForm(): InventoryContextType {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error(
      "useInventoryForm must be used within an InventoryFormProvider",
    );
  }
  return context;
}
