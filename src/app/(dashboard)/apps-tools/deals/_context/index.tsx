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
import { Deal, dealSchema } from "../_schemas";
import toast from "react-hot-toast";
import { z } from "zod";
import { DEFAULT_DEALS_VALUES } from "../_constants";
import api from "@/lib/api/axios-client";
import { SERVER_URL } from "@/constants";
import { useQueryClient } from "@tanstack/react-query";
import { handleAxiosError } from "@/lib/api/handle-axios-error";
import { AxiosError } from "axios";
import { ActionType } from "@/app/(dashboard)/_types";

interface DealsContextType {
  form: ReturnType<typeof useForm<Deal>>;
  loading: boolean;
  handleFieldChange: (fieldName: string, value: unknown) => void;
  submitDeal: () => Promise<void>;
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

const DealsContext = createContext<DealsContextType | undefined>(undefined);

export function DealsFormProvider({ children }: { children: React.ReactNode }) {
  const form = useForm<Deal>({
    resolver: zodResolver(dealSchema),
    mode: "onChange",
    defaultValues: DEFAULT_DEALS_VALUES as Deal,
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
      setValue(fieldName as keyof Deal, value as never, {
        shouldValidate: true,
      });
    },
    [setValue]
  );

  const submitDeal = useCallback(async () => {
    const formData = getValues();
    const isValid = await trigger([
      "name",
      "description",
      "discountPercentage",
      "maximumThreshold",
      "startDate",
      "endDate",
      "campaignId",
    ]);
    if (!isValid) {
      // const errors = form.formState.errors;
      // console.log("Form validation errors:", errors);
      // Object.keys(errors).forEach((key) => {
      //   const error = errors[key as keyof Deal];
      //   console.log(`Field "${key}":`, error?.message);
      // });
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
      } else res = await api.post(SERVER_URL + "/deals", formData);
      const { status, message } = res.data as {
        status: string;
        message?: string;
      };
      if (status === "success") {
        toast.success(
          message || `Deal ${isUpdating ? "updated" : "created"} successfully!`
        );
        reset(DEFAULT_DEALS_VALUES as Deal);
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
            } deal. Please try again.`
        );
      }
    } finally {
      setLoading(false);
    }
  }, [getValues, queryClient, trigger, reset, setAction]);

  return (
    <DealsContext.Provider
      value={{
        form,
        loading,
        handleFieldChange,
        submitDeal,
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
    </DealsContext.Provider>
  );
}

export function useDealsForm() {
  const context = useContext(DealsContext);
  if (context === undefined) {
    throw new Error("useDealsForm must be used within an DealsFormProvider");
  }
  return context;
}
