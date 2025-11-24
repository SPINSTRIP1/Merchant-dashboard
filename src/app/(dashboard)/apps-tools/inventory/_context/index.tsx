"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InventoryProduct, inventoryProductSchema } from "../_schemas";
import toast from "react-hot-toast";
import { z } from "zod";
import { DEFAULT_INVENTORY_VALUES, addInventorySteps } from "../_constants";

interface InventoryContextType {
  form: ReturnType<typeof useForm<InventoryProduct>>;
  handleNext: () => Promise<void>;
  handlePrevious: () => void;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  steps: string[];
  loading: boolean;
  handleFieldChange: (fieldName: string, value: unknown) => void;
  resetForm: () => void;
  submitProduct: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

export function InventoryFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const form = useForm<InventoryProduct>({
    resolver: zodResolver(inventoryProductSchema),
    mode: "onChange",
    defaultValues: DEFAULT_INVENTORY_VALUES as InventoryProduct,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { getValues, setValue, reset } = form;

  // Function to trigger validation on field change
  const handleFieldChange = useCallback(
    (fieldName: string, value: unknown) => {
      setValue(fieldName as keyof InventoryProduct, value as never, {
        shouldValidate: true,
      });
    },
    [setValue]
  );

  // Reset form to default values
  const resetForm = useCallback(() => {
    reset(DEFAULT_INVENTORY_VALUES as InventoryProduct);
    setCurrentStep(1);
  }, [reset]);

  // Submit product data
  const submitProduct = useCallback(async () => {
    setLoading(true);
    try {
      const formData = getValues();
      // TODO: Replace with actual API call
      console.log("Submitting product data:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Product created successfully!");
      resetForm();
    } catch (error) {
      console.error("Error submitting product:", error);
      if (error instanceof z.ZodError) {
        toast.error("Please check all form fields and try again.");
      } else {
        toast.error("Failed to create product. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [getValues, resetForm]);

  // Handle navigation to next step
  const handleNext = useCallback(async () => {
    try {
      if (currentStep < addInventorySteps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        // Last step - submit the form
        await submitProduct();
      }
    } catch (error) {
      console.log(error);
    }
  }, [currentStep, submitProduct]);

  // Handle navigation to previous step
  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  return (
    <InventoryContext.Provider
      value={{
        form,
        handleNext,
        handlePrevious,
        currentStep,
        setCurrentStep,
        steps: addInventorySteps,
        loading,
        handleFieldChange,
        resetForm,
        submitProduct,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventoryForm() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error(
      "useInventoryForm must be used within an InventoryFormProvider"
    );
  }
  return context;
}
