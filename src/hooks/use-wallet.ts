import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/api/axios-client";
import { USER_ACCOUNT_URL } from "@/constants";
import type { AxiosError } from "axios";
import { handleAxiosError } from "@/lib/api/handle-axios-error";
import type { KYCData } from "@/hooks/use-kyc";

/**
 * Reusable wallet hook — owns fetching the user's wallets and the create-wallet flow.
 */
export function useWallet() {
  const [isCreating, setIsCreating] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["user-wallets"],
    queryFn: async () => {
      try {
        const response = await api.get(USER_ACCOUNT_URL + "/wallet");
        return response.data.data;
      } catch (error) {
        console.log("Error fetching wallet data:", error);
        toast.error("Failed to fetch wallet data.");
        return [];
      }
    },
  });

  /**
   * Creates the merchant's NGN wallet (`POST /wallet { currency }`). The service takes identity
   * details from the merchant's verified KYC itself, so only approved merchants can create one.
   */
  async function createWallet(kyc?: Partial<KYCData>) {
    if (kyc?.status !== "VERIFIED") {
      toast.error("Complete your compliance verification to create a wallet.");
      return;
    }

    setIsCreating(true);
    try {
      await api.post(USER_ACCOUNT_URL + "/wallet", { currency: "NGN" });
      toast.success("Wallet created successfully!");
      refetch();
    } catch (error) {
      console.log("Error initiating wallet creation:", error);
      toast.error(handleAxiosError(error as AxiosError) || "Failed to create wallet. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }

  return {
    wallets: data,
    isLoading,
    error,
    refetch,
    createWallet,
    isCreating,
  };
}
