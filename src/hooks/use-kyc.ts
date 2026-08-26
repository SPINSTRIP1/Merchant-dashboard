import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { FALLBACK_BUSINESS_CATEGORIES } from "@/app/(dashboard)/settings/_constants";
import { ComplianceStatus } from "@/types";
import { useQuery } from "@tanstack/react-query";

export interface UBO {
  id: string;
  address: string;
  email: string;
  fullName: string;
  identityMetadata: {
    bvn: string;
    nin: string;
  };
}

export interface KYCData {
  adminNotes: string | null;
  articlesOfAssociationUrl: string;
  bankStatementUrl: string;
  businessCategory: string;
  businessDescription: string;
  businessModel: string;
  businessSubCategory: string;
  certificateOfIncorporationUrl: string;
  companyName: string;
  companyWebsite: string;
  countryOfIncorporation: string;
  createdAt: string;
  customerBase: string;
  expiryDate: string | null;
  id: string;
  logoUrl: string;
  monthlyProcessingAmount: string;
  proofOfAddressUrl: string;
  registrationNumber: string;
  status: string;
  ubos: UBO[];
  updatedAt: string;
  userId: string;
}

/**
 * Single source of truth for the merchant's KYC / compliance record.
 * Returns the full KYC payload from `/kyc/merchant/status`.
 *
 * Consumers that only need the verification status should use
 * `useComplianceStatus` (which derives it from this same query).
 */
export function useKyc() {
  const { data, isLoading, error, refetch } = useQuery<KYCData, Error>({
    queryKey: ["kyc-merchant-status"],
    queryFn: async () => {
      try {
        const response = await api.get(SERVER_URL + "/kyc/merchant/status");
        return response.data.data as KYCData;
      } catch (error) {
        console.log("Error fetching compliance status:", error);
        return {} as KYCData;
      }
    },
  });

  return {
    kyc: data,
    isLoading,
    error,
    refetch,
    status: (data?.status as ComplianceStatus) ?? "UNVERIFIED",
  };
}

/**
 * Fetches KYC business categories from `GET /kyc/business/categories`,
 * falling back to the static list when the request fails.
 */
export function useBusinessCategories() {
  const { data, isLoading, error, refetch } = useQuery<
    { id: string; name: string }[]
  >({
    queryKey: ["business-categories"],
    queryFn: async () => {
      try {
        const response = await api.get(SERVER_URL + "/kyc/business/categories");
        return response.data.data.categories;
      } catch (error) {
        console.log("Error fetching business categories:", error);
        return FALLBACK_BUSINESS_CATEGORIES;
      }
    },
  });

  return {
    categories: data ?? [],
    isLoading,
    error,
    refetch,
  };
}
