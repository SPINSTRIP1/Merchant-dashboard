import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { DealsStatsResponse } from "@/app/(dashboard)/apps-tools/deals/_types";
import { Campaign, Deal } from "@/app/(dashboard)/apps-tools/deals/_schemas";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

export interface DealSubscriptionStatus {
  subscribed: boolean;
}

/**
 * Single source of truth for the merchant's deals subscription status
 * from `GET /deals/subscriptions/status`. Shared by the deals page and the
 * inventory/menu step forms — all consumers share one cached query.
 */
export function useDealSubscription() {
  const { data, isLoading, error, refetch } = useQuery<DealSubscriptionStatus>({
    queryKey: ["deals-subscription-status"],
    queryFn: async () => {
      // `GET /deals/subscriptions` (without /status) is routed to `GET /deals/{id}` and 404s,
      // which used to make every merchant look unsubscribed.
      try {
        const response = await api.get(SERVER_URL + "/deals/subscriptions/status");
        const data = response.data.data as { subscribed?: boolean; isActive?: boolean } | undefined;
        return { subscribed: Boolean(data?.subscribed ?? data?.isActive) };
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

/**
 * Active deals from `GET /deals?status=ACTIVE` (first page), for "apply a deal" pickers.
 */
export function useActiveDeals() {
  const { data, isLoading, error, refetch } = useQuery<Deal[]>({
    queryKey: ["deals", "active"],
    queryFn: async () => {
      try {
        const response = await api.get(SERVER_URL + "/deals", {
          params: { page: 1, limit: 100, status: "ACTIVE" },
        });
        return ((response.data.data?.data ?? []) as Deal[]).filter((d) => d.status === "ACTIVE");
      } catch (error) {
        console.log("Error fetching active deals:", error);
        return [];
      }
    },
  });

  return { deals: data ?? [], isLoading, error, refetch };
}
