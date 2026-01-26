"use client";

import React, { useCallback, useMemo, useContext, createContext } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

import { Menu, menuSchema } from "../_schemas";
import {
  DEFAULT_MENU_VALUES,
  MENU_QUERY_KEY,
  addMenuSteps,
} from "../_constants";
import {
  createFormContext,
  BaseFormContextType,
} from "@/lib/create-form-context";
import api from "@/lib/api/axios-client";
import { SERVER_URL } from "@/constants";
import { handleAxiosError } from "@/lib/api/handle-axios-error";
import { AxiosError } from "axios";
import { flushPendingArrayInputs } from "@/components/ui/forms/form-array-input";
import { uploadFiles } from "@/lib/upload-files";

// ============================================================================
// Extended Context Type (for menu-specific properties)
// ============================================================================

interface MenuContextType extends BaseFormContextType<Menu> {
  submitMenu: () => Promise<void>;
  saveFormToLocalStorage: () => void;
  handleCreateDeals: () => void;
}

// ============================================================================
// Create Base Context Using Factory
// ============================================================================

const { Provider: BaseMenuProvider, useFormContext: useBaseMenuForm } =
  createFormContext<Menu>({
    name: "Menu",
    schema: menuSchema,
    defaultValues: DEFAULT_MENU_VALUES as Menu,
    steps: addMenuSteps,
    queryKeys: [MENU_QUERY_KEY],
    localStorageKey: "menuForm",
  });

// ============================================================================
// Extended Provider (with menu-specific submit logic)
// ============================================================================

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuFormProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseMenuProvider>
      <MenuExtendedProvider>{children}</MenuExtendedProvider>
    </BaseMenuProvider>
  );
}

function MenuExtendedProvider({ children }: { children: React.ReactNode }) {
  const baseContext = useBaseMenuForm();
  const { form, setLoading, resetForm, setAction, currentStep } = baseContext;
  const queryClient = useQueryClient();

  // Submit Menu data (menu-specific logic)
  const submitMenu = useCallback(async () => {
    setLoading(true);
    try {
      const values = form.getValues();
      const { files, ...payload } = values;
      delete payload.images;
      const isUpdating = Boolean(payload.id);
      let res;
      if (isUpdating) {
        const { id, ...updateData } = payload;
        res = await api.patch(
          SERVER_URL + "/menu/menu-items/" + id,
          updateData,
        );
      } else {
        res = await api.post(SERVER_URL + "/menu/menu-items", payload);
      }

      const { data, status, message } = res.data as {
        data: Menu;
        status: string;
        message?: string;
      };

      if (status === "success") {
        if (files?.length) {
          await uploadFiles({
            files,
            endpoint: `${SERVER_URL}/menu/menu-items/${data.id}/images`,
            entityName: "Menu",
            isUpdating,
          });
        }
        toast.success(
          message || `Menu ${isUpdating ? "updated" : "created"} successfully!`,
        );
        resetForm();
        setAction(null);
        queryClient.invalidateQueries({ queryKey: [MENU_QUERY_KEY] });
      }
    } catch (error) {
      console.log("Error submitting menu:", error);
      const err = handleAxiosError(error as AxiosError);
      if (error instanceof z.ZodError) {
        toast.error("Please check all form fields and try again.");
      } else {
        toast.error(err || "Failed to create menu. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [form, setLoading, resetForm, setAction, queryClient]);

  // Override handleNext to use submitMenu on last step and flush array inputs
  const handleNext = useCallback(async () => {
    const { currentStep, steps, setCurrentStep } = baseContext;

    // Flush any pending array inputs before navigation
    flushPendingArrayInputs();

    try {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        // Last step - submit the form
        await submitMenu();
      }
    } catch (error) {
      console.log("Error in menu handleNext:", error);
    }
  }, [baseContext, submitMenu]);

  // Save form data to localStorage
  const saveFormToLocalStorage = useCallback(() => {
    const formData = form.getValues();
    localStorage.setItem("menuFormDraft", JSON.stringify(formData));
    localStorage.setItem("menuFormStep", currentStep.toString());
  }, [form, currentStep]);

  // Handle Create Deals button - save form and navigate
  const handleCreateDeals = useCallback(() => {
    saveFormToLocalStorage();
    toast.success("Menu draft saved! You can continue after creating a deal.");
    setAction(null);
  }, [saveFormToLocalStorage, setAction]);

  const extendedContext = useMemo<MenuContextType>(
    () => ({
      ...baseContext,
      handleNext,
      submitMenu,
      saveFormToLocalStorage,
      handleCreateDeals,
    }),
    [
      baseContext,
      handleNext,
      submitMenu,
      saveFormToLocalStorage,
      handleCreateDeals,
    ],
  );

  return (
    <MenuContext.Provider value={extendedContext}>
      {children}
    </MenuContext.Provider>
  );
}

// ============================================================================
// Hook Export (maintains backward compatibility)
// ============================================================================

export function useMenuForm(): MenuContextType {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error("useMenuForm must be used within a MenuFormProvider");
  }
  return context;
}
