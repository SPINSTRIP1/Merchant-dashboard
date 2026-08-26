import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { DealsStatsResponse } from "@/app/(dashboard)/apps-tools/deals/_types";
import { Campaign } from "@/app/(dashboard)/apps-tools/deals/_schemas";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

export interface DealSubscriptionStatus {
  subscribed: boolean;
}

/**
 * Single source of truth for the merchant's deals subscription status
 * from `GET /deals/subscriptions`. Shared by the deals page and the
 * inventory/menu step forms — all consumers share one cached query.
 */
export function useDealSubscription() {
  const { data, isLoading, error, refetch } = useQuery<DealSubscriptionStatus>({
    queryKey: ["deals-subscription-status"],
    queryFn: async () => {
      try {
        const response = await api.get(SERVER_URL + "/deals/subscriptions");
        return response.data.data as DealSubscriptionStatus;
      } catch (error) {
        console.log("Error fetching subscription status:", error);
        return { subscribed: false };
      }
    },
  });

  return {
    subscribed: data?.subscribed ?? false,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Fetches deal counts (active/archived/canceled/inactive/total)
 * from `GET /deals/stats`.
 */
export function useDealStats() {
  const { data, isLoading, error, refetch } = useQuery<DealsStatsResponse>({
    queryKey: ["deals-stats"],
    queryFn: async () => {
      try {
        const response = await api.get(SERVER_URL + "/deals/stats");
        return response.data.data;
      } catch (error) {
        console.log("Error fetching deals stats:", error);
        toast.error("Failed to fetch deals statistics.");
        return { active: 0, archived: 0, canceled: 0, inactive: 0, total: 0 };
      }
    },
  });

  return {
    stats: data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Fetches the available deal campaigns from `GET /deals/campaigns`.
 */
export function useDealCampaigns() {
  const { data, isLoading, error, refetch } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: async () => {
      try {
        const response = await api.get(SERVER_URL + "/deals/campaigns");
        return response.data.data.data ?? [];
      } catch (error) {
        console.log("Error fetching campaigns:", error);
        return [];
      }
    },
  });

  return {
    campaigns: data ?? [],
    isLoading,
    error,
    refetch,
  };
}
