import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { ComplianceStatus } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useComplianceStatus() {
  const { error, data, isLoading, refetch } = useQuery<ComplianceStatus, Error>(
    {
      queryKey: ["compliance-status"],
      queryFn: async () => {
        try {
          const response = await api.get(SERVER_URL + "/kyc/merchant/status");
          return response.data.data.status as ComplianceStatus;
        } catch (error) {
          console.log("Error fetching compliance status:", error);
          return "UNVERIFIED" as ComplianceStatus;
        }
      },
    }
  );

  return {
    data: data,
    isLoading,
    error,
    refetch,
  };
}
