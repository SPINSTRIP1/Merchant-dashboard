import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { InventoryStatsResponse } from "@/app/(dashboard)/apps-tools/inventory/_types";
import { InventoryProduct } from "@/app/(dashboard)/apps-tools/inventory/_schemas";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

/**
 * Fetches inventory stock counts (total/inStock/lowStock/outOfStock)
 * from `GET /inventory/products/stats`.
 */
export function useInventoryStats() {
  const { data, isLoading, error, refetch } = useQuery<InventoryStatsResponse>({
    queryKey: ["inventory-stats"],
    queryFn: async () => {
      try {
        const response = await api.get(SERVER_URL + "/inventory/products/stats");
        return response.data.data as InventoryStatsResponse;
      } catch (error) {
        console.log("Error fetching inventory stats:", error);
        toast.error("Failed to fetch inventory statistics.");
        return {
          totalItems: 0,
          inStock: 0,
          lowStock: 0,
          outOfStock: 0,
          recentlyUpdated: 0,
        };
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
 * Fetches the merchant's product list from `GET /inventory/products`.
 */
export function useInventoryProducts() {
  const { data, isLoading, error, refetch } = useQuery<InventoryProduct[]>({
    queryKey: ["inventory-products"],
    queryFn: async () => {
      try {
        const response = await api.get(SERVER_URL + "/inventory/products");
        return response.data.data.data ?? [];
      } catch (error) {
        console.log("Error fetching products:", error);
        return [];
      }
    },
  });

  return {
    products: data ?? [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Fetches a single inventory product from `GET /inventory/products/{id}`.
 */
export function useInventoryItem(itemId: string | null | undefined) {
  const { data, isLoading, error, refetch } = useQuery<InventoryProduct | null>(
    {
      queryKey: ["inventory-item", itemId],
      queryFn: async () => {
        try {
          const response = await api.get(
            SERVER_URL + "/inventory/products/" + itemId,
          );
          return (response.data.data as InventoryProduct) ?? null;
        } catch (error) {
          console.log("Error fetching inventory item:", error);
          return null;
        }
      },
      enabled: !!itemId,
    },
  );

  return {
    item: data ?? null,
    isLoading,
    error,
    refetch,
  };
}
