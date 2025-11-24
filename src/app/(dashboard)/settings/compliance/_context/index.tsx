"use client";

import React, { createContext, useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  businessOperationsSchema,
  companyDocumentsSchema,
  companyInformationSchema,
  CompleteKycFormData,
  completeKycSchema,
  uboInformationSchema,
} from "../_schemas";
import { createMerchantKyc } from "../../_api";
import toast from "react-hot-toast";
import z from "zod";
import { useComplianceStatus } from "@/hooks/use-compliance";
import { DEFAULT_COMPLIANCE_VALUES, steps } from "../_constants";

interface ComplianceContextType {
  form: ReturnType<typeof useForm<CompleteKycFormData>>;
  handleNext: () => Promise<void>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  steps: string[];
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  isCurrentStepValid: boolean;
  handleFieldChange: (fieldName: string, value: string) => void;
  addUbo: () => void;
  removeUbo: (index: number) => void;
  updateUboField: (index: number, field: string, value: string) => void;
}

const ComplianceContext = createContext<ComplianceContextType | undefined>(
  undefined
);

export function ComplianceFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const form = useForm<CompleteKycFormData>({
    resolver: zodResolver(completeKycSchema),
    mode: "onChange",
    defaultValues: DEFAULT_COMPLIANCE_VALUES,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [isCurrentStepValid, setIsCurrentStepValid] = useState(false);
  const { refetch } = useComplianceStatus();
  const getCurrentStepSchema = React.useCallback(() => {
    switch (currentStep) {
      case 1:
        return companyInformationSchema;
      case 2:
        return businessOperationsSchema;
      case 3:
        return companyDocumentsSchema;
      case 4:
        return uboInformationSchema;
      default:
        return companyInformationSchema;
    }
  }, [currentStep]);
  const { getValues, setValue, setError } = form;
  // Function to validate current step
  const validateCurrentStep = React.useCallback(() => {
    const formData = getValues();
    const stepSchema = getCurrentStepSchema();

    try {
      stepSchema.parse(formData);
      return true;
    } catch {
      return false;
    }
  }, [getValues, getCurrentStepSchema]);

  // Update validation when step changes
  React.useEffect(() => {
    const isValid = validateCurrentStep();
    setIsCurrentStepValid(currentStep === steps.length ? true : isValid);
  }, [currentStep, validateCurrentStep, steps.length]);

  // Function to trigger validation on field change
  const handleFieldChange = React.useCallback(
    (fieldName: string, value: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (setValue as any)(fieldName, value, { shouldValidate: true });
      // Trigger validation after a short delay to allow state to update
      setTimeout(() => {
        const isValid = validateCurrentStep();
        setIsCurrentStepValid(isValid);
      }, 10);
    },
    [setValue, validateCurrentStep]
  );

  // UBO Management Functions
  const addUbo = React.useCallback(() => {
    const currentUbos = getValues("ubos");
    const newUbo = {
      fullName: "",
      email: "",
      address: "",
      phoneNumber: "",
      identityMetadata: {
        bvn: "",
        nin: "",
      },
      bankStatement: "",
    };
    setValue("ubos", [...currentUbos, newUbo], { shouldValidate: true });
  }, [getValues, setValue]);

  const removeUbo = React.useCallback(
    (index: number) => {
      const currentUbos = getValues("ubos");

      if (currentUbos.length > 1) {
        // Keep at least one UBO
        const newUbos = currentUbos.filter((_, i) => i !== index);
        setValue("ubos", newUbos, { shouldValidate: true });
      }
    },
    [getValues, setValue]
  );

  const updateUboField = React.useCallback(
    (index: number, field: string, value: string) => {
      const currentUbos = getValues("ubos");
      const updatedUbos = currentUbos.map((ubo, i) => {
        if (i === index) {
          if (field.includes(".")) {
            // Handle nested fields like identityMetadata.bvn
            const [parent, child] = field.split(".");
            return {
              ...ubo,
              [parent]: {
                ...(ubo[parent as keyof typeof ubo] as object),
                [child]: value,
              },
            };
          } else {
            return { ...ubo, [field]: value };
          }
        }
        return ubo;
      });
      setValue("ubos", updatedUbos, { shouldValidate: true });
    },
    [getValues, setValue]
  );

  const handleNext = async () => {
    const formData = getValues();
    console.log("Current form data:", formData);

    // Get current step schema
    const stepSchema = getCurrentStepSchema();

    try {
      // Validate current step

      if (currentStep < steps.length) {
        stepSchema.parse(formData);

        setCurrentStep(currentStep + 1);
      } else {
        setLoading(true);
        try {
          // Transform form data to match API interface
          const apiData: CompleteKycFormData = {
            ...formData,
            certificateOfIncorporation:
              formData.certificateOfIncorporation || undefined,
            articlesOfAssociation: formData.articlesOfAssociation,
            proofOfAddress: formData.proofOfAddress,
            bankStatement: formData.bankStatement,
            logo: formData.logo || undefined,
            redirectUrl: formData.redirectUrl || window.location.origin,
          };

          const response = await createMerchantKyc(apiData);
          console.log(response);
          refetch();
          toast.success("KYC data submitted successfully!");
          setIsOpen(true);
        } catch (error) {
          console.error("Error submitting KYC:", error);
          toast.error("Failed to submit KYC data. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const invalidFields = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        console.log(invalidFields);
        // Set form errors for the current step
        error.issues.forEach((err) => {
          if (err.path.length > 0) {
            setError(err.path.join(".") as keyof CompleteKycFormData, {
              type: "manual",
              message: err.message,
            });
          }
        });
        toast.error("Please fill in all required fields correctly.");
      }
    }
  };

  return (
    <ComplianceContext.Provider
      value={{
        form,
        handleNext,
        currentStep,
        setCurrentStep,
        steps,
        isOpen,
        setIsOpen,
        loading,
        isCurrentStepValid,
        handleFieldChange,
        addUbo,
        removeUbo,
        updateUboField,
      }}
    >
      {children}
    </ComplianceContext.Provider>
  );
}

export function useComplianceForm() {
  const context = useContext(ComplianceContext);
  if (context === undefined) {
    throw new Error(
      "useCompliance must be used within an ComplianceFormProvider"
    );
  }
  return context;
}
