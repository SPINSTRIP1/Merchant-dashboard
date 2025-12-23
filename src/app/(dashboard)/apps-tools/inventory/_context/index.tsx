"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InventoryProduct, inventoryProductSchema } from "../_schemas";
import toast from "react-hot-toast";
import { z } from "zod";
import { DEFAULT_INVENTORY_VALUES, addInventorySteps } from "../_constants";
import api from "@/lib/api/axios-client";
import { INVENTORY_SERVER_URL } from "@/constants";
import { useQueryClient } from "@tanstack/react-query";
import { ActionType } from "@/app/(dashboard)/_types";

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
  const [action, setAction] = useState<ActionType>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [loading, setLoading] = useState(false);
  const { getValues, setValue, reset } = form;
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
      const { files, ...formData } = getValues();
      delete formData.media;
      const isUpdating = Boolean(formData.id);
      let res;
      if (isUpdating) {
        const { id, ...updateData } = formData;
        res = await api.patch(
          INVENTORY_SERVER_URL + "/products/" + id,
          updateData
        );
      } else res = await api.post(INVENTORY_SERVER_URL + "/products", formData);
      const { data, status, message } = res.data as {
        data: InventoryProduct;
        status: string;
        message?: string;
      };
      if (status === "success") {
        if (files?.length) {
          try {
            const formData = new FormData();
            files.forEach((file) => formData.append("files", file));
            await api.post(
              INVENTORY_SERVER_URL + `/products/${data.id}/images`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
          } catch (error) {
            console.log("Error uploading files:", error);
            toast.error(
              `Product ${
                isUpdating ? "updated" : "created"
              } but failed to upload images. Please try again.`
            );
          }
        }
        toast.success(
          message ||
            `Product ${isUpdating ? "updated" : "created"} successfully!`
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
  }, [getValues, resetForm, queryClient]);

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
