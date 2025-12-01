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
import { Menu, menuSchema } from "../_schemas";
import toast from "react-hot-toast";
import { z } from "zod";
import {
  DEFAULT_MENU_VALUES,
  MENU_QUERY_KEY,
  addMenuSteps,
} from "../_constants";
import api from "@/lib/api/axios-client";
import { MENUS_SERVER_URL } from "@/constants";
import { useQueryClient } from "@tanstack/react-query";

export type ActionType =
  | "add"
  | "edit"
  | "delete"
  | "duplicate"
  | "details"
  | null;
interface MenuContextType {
  form: ReturnType<typeof useForm<Menu>>;
  handleNext: () => Promise<void>;
  handlePrevious: () => void;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  steps: string[];
  loading: boolean;
  handleFieldChange: (fieldName: string, value: unknown) => void;
  resetForm: () => void;
  submitMenu: () => Promise<void>;
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

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuFormProvider({ children }: { children: React.ReactNode }) {
  const form = useForm<Menu>({
    resolver: zodResolver(menuSchema),
    mode: "onChange",
    defaultValues: DEFAULT_MENU_VALUES as Menu,
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
      setValue(fieldName as keyof Menu, value as never, {
        shouldValidate: true,
      });
    },
    [setValue]
  );

  // Reset form to default values
  const resetForm = useCallback(() => {
    reset(DEFAULT_MENU_VALUES as Menu);
    setCurrentStep(1);
  }, [reset]);

  // Submit Menu data
  const submitMenu = useCallback(async () => {
    setLoading(true);
    try {
      const values = getValues();
      const { files, ...payload } = values;
      delete payload.images;
      const isUpdating = Boolean(payload.id);
      let res;
      if (isUpdating) {
        const { id, ...updateData } = payload;
        res = await api.patch(
          MENUS_SERVER_URL + "/menu-items/" + id,
          updateData
        );
      } else res = await api.post(MENUS_SERVER_URL + "/menu-items", payload);
      const { data, status, message } = res.data as {
        data: Menu;
        status: string;
        message?: string;
      };
      if (status === "success") {
        if (files?.length) {
          try {
            const formData = new FormData();
            files.forEach((file) => formData.append("files", file));
            await api.post(
              MENUS_SERVER_URL + `/menu-items/${data.id}/images`,
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
              `Menu ${
                isUpdating ? "updated" : "created"
              } but failed to upload images. Please try again.`
            );
          }
        }
        toast.success(
          message || `Menu ${isUpdating ? "updated" : "created"} successfully!`
        );
        resetForm();
        setAction(null);
        queryClient.invalidateQueries({ queryKey: [MENU_QUERY_KEY] });
      }
    } catch (error) {
      console.log("Error submitting menu:", error);
      if (error instanceof z.ZodError) {
        toast.error("Please check all form fields and try again.");
      } else {
        toast.error("Failed to create menu. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [getValues, resetForm, queryClient]);

  // Handle navigation to next step
  const handleNext = useCallback(async () => {
    try {
      if (currentStep < addMenuSteps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        // Last step - submit the form
        await submitMenu();
      }
    } catch (error) {
      console.log(error);
    }
  }, [currentStep, submitMenu]);

  // Handle navigation to previous step
  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  return (
    <MenuContext.Provider
      value={{
        form,
        handleNext,
        handlePrevious,
        currentStep,
        setCurrentStep,
        steps: addMenuSteps,
        loading,
        handleFieldChange,
        resetForm,
        submitMenu,
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
    </MenuContext.Provider>
  );
}

export function useMenuForm() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error("useMenuForm must be used within an MenuFormProvider");
  }
  return context;
}
