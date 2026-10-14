import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { USER_ACCOUNT_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { useReduxAuth } from "@/hooks/use-redux-auth";
import type { AccountCapabilities, UserData } from "@/store/slices/authSlice";

interface MeResponse {
  user: UserData;
  permissions: AccountCapabilities;
}

/**
 * Fetches the signed-in account from `GET /auth/me` (user-account service) and syncs it into the
 * auth store, so profile changes and capability flags (`isMerchant`, `canCreateDeal`, …) made since
 * login show up without logging in again. Mount once, in the dashboard layout.
 */
export function useMe() {
  const { isAuthenticated, updateUser } = useReduxAuth();

  const { data, isLoading, error, refetch } = useQuery<MeResponse | null>({
    queryKey: ["auth-me"],
    queryFn: async () => {
      try {
        const response = await api.get(`${USER_ACCOUNT_URL}/auth/me`);
        return (response.data.data as MeResponse) ?? null;
      } catch (error) {
        console.log("Error fetching current user:", error);
        return null;
      }
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data?.user) updateUser({ ...data.user, capabilities: data.permissions });
  }, [data, updateUser]);

  return {
    user: data?.user ?? null,
    capabilities: data?.permissions ?? null,
    isLoading,
    error,
    refetch,
  };
}
