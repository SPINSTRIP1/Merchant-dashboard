"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  FormProvider,
  useForm,
  UseFormReturn,
  FieldValues,
  DefaultValues,
  Path,
  PathValue,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { ActionType } from "@/app/(dashboard)/_types";
import { flushPendingArrayInputs } from "@/components/ui/forms/form-array-input";

// ============================================================================
// Types
// ============================================================================

/**
 * Base context type that all form contexts share
 */
export interface BaseFormContextType<T extends FieldValues> {
  // Form instance
  form: UseFormReturn<T>;

  // Loading state
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;

  // Search & filter state
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  debouncedSearch: string;
  statusFilter: string;
  setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;

  // Action state (add/edit modal)
  action: ActionType;
  setAction: React.Dispatch<React.SetStateAction<ActionType>>;

  // Step navigation (for multi-step forms)
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  steps: string[];
  handleNext: () => Promise<void>;
  handlePrevious: () => void;

  // Form operations
  handleFieldChange: (fieldName: string, value: unknown) => void;
  resetForm: () => void;
}

/**
 * Configuration for creating a form context
 */
export interface CreateFormContextConfig<T extends FieldValues> {
  /** Name of the entity (used in error messages) */
  name: string;

  /** Zod schema for validation */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodType<T, any, any>;

  /** Default form values */
  defaultValues: DefaultValues<T>;

  /** Steps for multi-step forms */
  steps: string[];

  /** Query keys to invalidate on successful submit */
  queryKeys?: string[];

  /** Custom submit handler - if not provided, handleNext will just navigate steps */
  onSubmit?: (
    values: T,
    helpers: {
      form: UseFormReturn<T>;
      setLoading: React.Dispatch<React.SetStateAction<boolean>>;
      resetForm: () => void;
      setAction: React.Dispatch<React.SetStateAction<ActionType>>;
      queryClient: ReturnType<typeof useQueryClient>;
    },
  ) => Promise<void>;

  /** Optional: fields to validate before moving to next step (keyed by step number) */
  stepValidation?: Record<number, (keyof T)[]>;

  /** Optional: localStorage key for saving form drafts */
  localStorageKey?: string;
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Creates a form context with all the common patterns used across the app.
 *
 * @example
 * ```tsx
 * const {
 *   Provider: InventoryFormProvider,
 *   useFormContext: useInventoryForm,
 * } = createFormContext({
 *   name: "Inventory",
 *   schema: inventoryProductSchema,
 *   defaultValues: DEFAULT_INVENTORY_VALUES,
 *   steps: addInventorySteps,
 *   queryKeys: ["inventory-products", "inventory-stats"],
 *   onSubmit: async (values, { setLoading, resetForm, queryClient }) => {
 *     // Custom submit logic
 *   },
 * });
 * ```
 */
export function createFormContext<T extends FieldValues>(
  config: CreateFormContextConfig<T>,
) {
  const {
    name,
    schema,
    defaultValues,
    steps,
    queryKeys = [],
    onSubmit,
    stepValidation,
    localStorageKey,
  } = config;

  // Create the context
  const FormContext = createContext<BaseFormContextType<T> | undefined>(
    undefined,
  );
  FormContext.displayName = `${name}FormContext`;

  // Create the provider component
  function FormContextProvider({ children }: { children: React.ReactNode }) {
    const form = useForm<T>({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolver: zodResolver(schema) as any,
      mode: "onChange",
      defaultValues,
    });

    const [action, setAction] = useState<ActionType>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [loading, setLoading] = useState(false);

    const { setValue, reset } = form;
    const queryClient = useQueryClient();

    // Debounce search query
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearch(searchQuery);
      }, 500);
      return () => clearTimeout(timer);
    }, [searchQuery]);

    // Restore form data from localStorage on mount (if configured)
    useEffect(() => {
      if (!localStorageKey) return;

      const savedFormData = localStorage.getItem(`${localStorageKey}Draft`);
      const savedStep = localStorage.getItem(`${localStorageKey}Step`);

      if (savedFormData && savedStep) {
        try {
          const parsedData = JSON.parse(savedFormData);
          setTimeout(() => {
            reset(parsedData);
            setCurrentStep(parseInt(savedStep));
            setAction("add");
          }, 300);
        } catch (error) {
          console.log("Error restoring form data:", error);
          localStorage.removeItem(`${localStorageKey}Draft`);
          localStorage.removeItem(`${localStorageKey}Step`);
        }
      }
    }, [reset]);

    // Handle field change with validation
    const handleFieldChange = useCallback(
      (fieldName: string, value: unknown) => {
        setValue(fieldName as Path<T>, value as PathValue<T, Path<T>>, {
          shouldValidate: true,
        });
      },
      [setValue],
    );

    // Reset form to default values
    const resetForm = useCallback(() => {
      reset(defaultValues);
      setCurrentStep(1);
      setAction(null);

      // Clear localStorage if configured
      if (localStorageKey) {
        localStorage.removeItem(`${localStorageKey}Draft`);
        localStorage.removeItem(`${localStorageKey}Step`);
      }
    }, [reset]);

    // Handle navigation to next step
    const handleNext = useCallback(async () => {
      // Flush any pending array inputs before navigation
      flushPendingArrayInputs();

      try {
        // Validate current step fields if configured
        if (stepValidation && stepValidation[currentStep]) {
          const fieldsToValidate = stepValidation[currentStep];
          const isValid = await form.trigger(fieldsToValidate as Path<T>[]);
          if (!isValid) return;
        }

        if (currentStep < steps.length) {
          setCurrentStep(currentStep + 1);
        } else if (onSubmit) {
          // Last step - submit the form
          await onSubmit(form.getValues(), {
            form: form as UseFormReturn<T>,
            setLoading,
            resetForm,
            setAction,
            queryClient,
          });

          // Invalidate query keys on success
          queryKeys.forEach((key) => {
            queryClient.invalidateQueries({ queryKey: [key] });
          });
        }
      } catch (error) {
        console.log(`Error in ${name} handleNext:`, error);
      }
    }, [currentStep, form, queryClient, resetForm]);

    // Handle navigation to previous step
    const handlePrevious = useCallback(() => {
      if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
      }
    }, [currentStep]);

    const contextValue = useMemo<BaseFormContextType<T>>(
      () => ({
        form: form as UseFormReturn<T>,
        loading,
        setLoading,
        searchQuery,
        setSearchQuery,
        debouncedSearch,
        statusFilter,
        setStatusFilter,
        sortBy,
        setSortBy,
        action,
        setAction,
        currentStep,
        setCurrentStep,
        steps,
        handleNext,
        handlePrevious,
        handleFieldChange,
        resetForm,
      }),
      [
        form,
        loading,
        searchQuery,
        debouncedSearch,
        statusFilter,
        sortBy,
        action,
        currentStep,
        handleNext,
        handlePrevious,
        handleFieldChange,
        resetForm,
      ],
    );

    return (
      <FormContext.Provider value={contextValue}>
        <FormProvider {...form}>{children}</FormProvider>
      </FormContext.Provider>
    );
  }

  // Create the hook
  function useFormContext(): BaseFormContextType<T> {
    const context = useContext(FormContext);
    if (context === undefined) {
      throw new Error(
        `use${name}Form must be used within a ${name}FormProvider`,
      );
    }
    return context;
  }

  return {
    Provider: FormContextProvider,
    useFormContext,
    Context: FormContext,
  };
}

// ============================================================================
// Utility Types for Extended Contexts
// ============================================================================

/**
 * Helper type to extend the base context with additional properties
 */
export type ExtendedFormContextType<
  T extends FieldValues,
  Extensions extends Record<string, unknown>,
> = BaseFormContextType<T> & Extensions;
