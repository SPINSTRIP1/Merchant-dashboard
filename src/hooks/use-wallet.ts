import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/api/axios-client";
import { USER_ACCOUNT_URL } from "@/constants";
import { countries } from "@/data/countries";
import { useReduxAuth } from "@/hooks/use-redux-auth";
import { KYCData } from "@/hooks/use-kyc";

/**
 * Reusable wallet hook — owns fetching the user's wallets and the
 * create-wallet flow (KYC validation, currency resolution, toasts).
 */
export function useWallet() {
  const { user } = useReduxAuth();
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
   * Creates a wallet using the merchant's KYC record.
   * Validates required KYC fields and resolves currency from the
   * country of incorporation before calling the API.
   */
  async function createWallet(kyc?: KYCData) {
    const nin = kyc?.ubos?.[0]?.identityMetadata?.nin;
    const bvn = kyc?.ubos?.[0]?.identityMetadata?.bvn;
    const address = kyc?.ubos?.[0]?.address;
    const currency = countries.find(
      (c) => c.name === kyc?.countryOfIncorporation,
    )?.currency;

    if (!nin || !bvn || !address) {
      toast.error(
        "Missing KYC information. Please complete your KYC to create a wallet.",
      );
      return;
    }

    if (!currency) {
      toast.error("Could not determine currency from country of incorporation.");
      return;
    }

    setIsCreating(true);
    try {
      await api.post(USER_ACCOUNT_URL + "/wallet", {
        currency,
        customer_email: user?.email,
        customer_mobile: user?.phoneNumber,
        customer_name: user?.fullName,
        bvn,
        nin,
        address,
        dob: user?.dob || "1990-05-14",
      });

      toast.success("Wallet created successfully!");
      refetch();
    } catch (error) {
      console.log("Error initiating wallet creation:", error);
      toast.error("Failed to create wallet. Please try again.");
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
