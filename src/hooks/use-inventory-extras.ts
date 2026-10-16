/**
 * Inventory features from the prototype that sit alongside the existing inventory hooks:
 * - restock and the low-stock warning use existing endpoints (the product update call and the
 *   products list);
 * - per-item history (activity log, price history, monthly sales) is SAMPLE DATA from
 *   src/mocks/inventory.ts until the backend records it.
 */
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { handleAxiosError } from "@/lib/api/handle-axios-error";
import type { InventoryProduct } from "@/app/(dashboard)/apps-tools/inventory/_schemas";
import {
  sampleMonthlySales,
  samplePriceHistory,
  sampleStockActivity,
} from "@/mocks/inventory";

/**
 * Adds stock to a DEFINITE product with the Inventory stock endpoint
 * (`PATCH /inventory/products/{id}/inventory { quantity: +n, reason }`), which records the change.
 */
export function useRestockItem() {
  const queryClient = useQueryClient();
  return useMutation({
    // `currentQuantity` is kept in the signature for callers; the stock endpoint adjusts incrementally.
    mutationFn: ({ id, add }: { id: string; currentQuantity: number; add: number }) =>
      api.patch(`${SERVER_URL}/inventory/products/${id}/inventory`, {
        quantity: add,
        reason: "Restock from dashboard",
      }),
    onSuccess: (_res, { add }) => {
      toast.success(`Restocked +${add}`);
      queryClient.invalidateQueries({ queryKey: ["inventory-products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-item"] });
    },
    onError: (error) => toast.error(handleAxiosError(error as AxiosError) || "Failed to restock item"),
  });
}

/** The first low-stock product, for the warning banner (`GET /inventory/products?stockStatus=lowStock`). */
export function useLowStockItem({ enabled = true }: { enabled?: boolean } = {}) {
  const { data } = useQuery<InventoryProduct | null>({
    queryKey: ["inventory-low-stock-item"],
    queryFn: async () => {
      try {
        const response = await api.get(`${SERVER_URL}/inventory/products`, {
          params: { page: 1, limit: 1, stockStatus: "lowStock" },
        });
        return (response.data.data?.data?.[0] as InventoryProduct) ?? null;
      } catch (error) {
        console.log("Error fetching low stock item:", error);
        return null;
      }
    },
    enabled,
  });
  return data ?? null;
}

/** Stock activity, price history and monthly unit sales for one item. SAMPLE DATA. */
export function useItemHistory(itemId: string | null | undefined, currentPrice: number) {
  return useMemo(
    () =>
      itemId
        ? {
            activity: sampleStockActivity(itemId),
            priceHistory: samplePriceHistory(itemId, currentPrice),
            monthlySales: sampleMonthlySales(itemId),
          }
        : null,
    [itemId, currentPrice]
  );
}
