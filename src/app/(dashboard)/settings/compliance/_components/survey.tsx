"use client";
import ContainerWrapper from "@/components/container-wrapper";
import SelectDropdown from "@/components/select-dropdown";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { MultiSelect } from "../../_components/multi-select";
import { useQuery } from "@tanstack/react-query";
import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { FALLBACK_BUSINESS_CATEGORIES } from "../../_constants";
import { useComplianceForm } from "../_context";
export default function Survey() {
  const { data: businessCategories, isLoading } = useQuery<
    { id: string; name: string }[]
  >({
    queryKey: ["business-categories"],
    queryFn: async () => {
      try {
        const response = await api.get(SERVER_URL + "/kyc/business/categories");
        return response.data.data.categories;
      } catch (error) {
        console.log("Error fetching compliance status:", error);
        return FALLBACK_BUSINESS_CATEGORIES;
      }
    },
  });
  const {
    form: {
      getValues,
      formState: { errors },
    },
    handleFieldChange,
  } = useComplianceForm();
  return (
    <div className="space-y-5">
      <ContainerWrapper className="space-y-2.5">
        <Label>Business Category</Label>
        {isLoading ? (
          <div className="w-full !h-[49px] p-3 flex items-center gap-x-2 rounded-2xl border border-neutral-accent">
            <p>Fetching business categories...</p>
            <Loader2 className="animate-spin size-5" />
          </div>
        ) : (
          <SelectDropdown
            className="!rounded-2xl border border-neutral-accent"
            placeholder="Choose your business category"
            options={businessCategories?.map((item) => item.name)}
            value={getValues("businessCategory")}
            onValueChange={(value) => {
              handleFieldChange("businessCategory", value);
            }}
            category="Business Category"
          />
        )}
        <div className="h-5 mt-1">
          {errors.businessCategory && (
            <p className="text-red-500 text-sm">
              {errors.businessCategory.message}
            </p>
          )}
        </div>
      </ContainerWrapper>
      <ContainerWrapper className="space-y-2.5">
        <Label className="mb-2.5">What is your Customer Base?</Label>

        <MultiSelect
          options={[
            { label: "Below 100", value: "BELOW_100" },
            { label: "100 - 999", value: "HUNDRED_TO_999" },
            { label: "1,000 - 9,999 ", value: "THOUSAND_TO_9999" },
            { label: "Above 10,000", value: "OVER_10000" },
          ]}
          value={getValues("customerBase")}
          onValueChange={(value) => {
            handleFieldChange("customerBase", value);
          }}
        />
        <div className="h-5 mt-1">
          {errors.customerBase && (
            <p className="text-red-500 text-sm">
              {errors.customerBase.message}
            </p>
          )}
        </div>
      </ContainerWrapper>
      <ContainerWrapper className="space-y-2.5">
        <Label className="mb-2.5">What is your Business Model?</Label>
        <MultiSelect
          value={getValues("businessModel")}
          options={[
            { label: "B2B", value: "B2B" },
            { label: "B2C", value: "B2C" },
            { label: "B2B2C", value: "B2B2C" },
            { label: "Other", value: "OTHER" },
          ]}
          onValueChange={(value) => {
            handleFieldChange("businessModel", value);
          }}
        />
        <div className="h-5 mt-1">
          {errors.businessModel && (
            <p className="text-red-500 text-sm">
              {errors.businessModel.message}
            </p>
          )}
        </div>
      </ContainerWrapper>
      <ContainerWrapper className="space-y-2.5">
        <Label className="mb-2.5">How Much do you Process Monthly?</Label>
        <MultiSelect
          options={[
            { label: "Below 100K", value: "BELOW_100K" },
            { label: "100K - 999K", value: "HUNDRED_K_TO_999K" },
            { label: "1M - 9.9M", value: "ONE_M_TO_9_9M" },
            { label: "Above 10M", value: "ABOVE_10M" },
          ]}
          value={getValues("monthlyProcessingAmount")}
          onValueChange={(value) => {
            handleFieldChange("monthlyProcessingAmount", value);
          }}
        />
        <div className="h-5 mt-1">
          {errors.monthlyProcessingAmount && (
            <p className="text-red-500 text-sm">
              {errors.monthlyProcessingAmount.message}
            </p>
          )}
        </div>
      </ContainerWrapper>
    </div>
  );
}
