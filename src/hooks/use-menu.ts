import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { handleAxiosError } from "@/lib/api/handle-axios-error";
import { useServerPagination } from "@/hooks/use-server-pagination";
import { useReduxAuth } from "@/hooks/use-redux-auth";
import { useKyc } from "@/hooks/use-kyc";
import type { Menu, MenuStatus } from "@/app/(dashboard)/apps-tools/menu/_schemas";
import { MENU_QUERY_KEY } from "@/app/(dashboard)/apps-tools/menu/_constants";
import { mockResponse, seededRandom, between } from "@/mocks/utils";
import { SAMPLE_PUBLIC_MENU } from "@/mocks/public-menu";
import type { AxiosError } from "axios";

/** Built-in menu categories; merchants can add their own on top of these. */
export const BASE_MENU_CATEGORIES = ["BREAKFAST", "LUNCH", "DINNER"];

/** "BREAKFAST" → "Breakfast", "Small chops" stays as typed. */
export const categoryLabel = (value: string) =>
  value === value.toUpperCase()
    ? value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, " ")
    : value;

/**
 * Number of menu items, optionally filtered by status, from the `count` of
 * `GET /menu/menu-items` (fetches one row). e.g. `{ status: "AVAILABLE" }` for dishes on sale.
 */
export function useMenuItemsCount({ status }: { status?: string } = {}) {
  const { data, isLoading, error, refetch } = useQuery<number>({
    queryKey: ["menu-items-count", status ?? "All"],
    queryFn: async () => {
      try {
        const response = await api.get(`${SERVER_URL}/menu/menu-items`, {
          params: { page: 1, limit: 1, ...(status ? { status } : {}) },
        });
        return response.data.data?.count ?? 0;
      } catch (error) {
        console.log("Error fetching menu items count:", error);
        return 0;
      }
    },
  });

  return { count: data ?? 0, isLoading, error, refetch };
}

/**
 * Paginated menu items from `GET /menu/menu-items` (page synced to `?page=` in the URL).
 */
export function useMenuItems({
  search = "",
  status = "",
  category = "",
}: { search?: string; status?: string; category?: string } = {}) {
  return useServerPagination<Menu>({
    queryKey: MENU_QUERY_KEY,
    endpoint: `${SERVER_URL}/menu/menu-items`,
    searchQuery: search,
    filters: { status, category },
  });
}

/**
 * Featured menu items from `GET /menu/menu-items?isFeatured=true`. Independent of the main
 * table's `?page=` so paging the table doesn't change this list.
 */
export function useFeaturedMenuItems({ limit = 12 }: { limit?: number } = {}) {
  const { data, isLoading, error, refetch } = useQuery<Menu[]>({
    queryKey: [MENU_QUERY_KEY, "featured", limit],
    queryFn: async () => {
      try {
        const response = await api.get(`${SERVER_URL}/menu/menu-items`, {
          params: { page: 1, limit, isFeatured: true },
        });
        return (response.data.data?.data ?? []).filter((m: Menu) => m.isFeatured);
      } catch (error) {
        console.log("Error fetching featured menu items:", error);
        return [];
      }
    },
  });

  return { items: data ?? [], isLoading, error, refetch };
}

/** Up to 100 of the merchant's menu items, for lists that need the whole menu (categories, top menus). */
function useAllMenuItems() {
  return useQuery<Menu[]>({
    queryKey: [MENU_QUERY_KEY, "all"],
    queryFn: async () => {
      try {
        const response = await api.get(`${SERVER_URL}/menu/menu-items`, {
          params: { page: 1, limit: 100 },
        });
        return response.data.data?.data ?? [];
      } catch (error) {
        console.log("Error fetching menu items:", error);
        return [];
      }
    },
  });
}

/** Menu categories: the built-in three plus any custom category used on an existing item. */
export function useMenuCategories() {
  const { data, isLoading } = useAllMenuItems();
  const categories = useMemo(() => {
    const used = (data ?? []).map((m) => m.category).filter(Boolean);
    return [...new Set([...BASE_MENU_CATEGORIES, ...used])];
  }, [data]);
  return { categories, isLoading };
}

export interface TopMenuItem {
  id: string;
  name: string;
  image?: string;
  price: number;
  orderCount: number;
}

/**
 * Best-selling menu items for a month ("YYYY-MM"), ranked by orders.
 * The items are the merchant's real menu; ORDER COUNTS ARE SAMPLE DATA until the backend reports
 * menu orders — swap the order-count derivation for the real endpoint when it exists.
 */
export function useTopMenus({ month }: { month: string }) {
  const { data: items, isLoading } = useAllMenuItems();

  const topMenus = useMemo<TopMenuItem[]>(() => {
    const seedFor = (id: string) =>
      [...`${id}:${month}`].reduce((hash, ch) => (hash * 31 + ch.charCodeAt(0)) >>> 0, 7);
    return (items ?? [])
      .filter((m) => m.id && m.status === "AVAILABLE")
      .map((m) => ({
        id: m.id!,
        name: m.name,
        image: m.images?.[0],
        price: m.price,
        orderCount: between(seededRandom(seedFor(m.id!)), 0, 240),
      }))
      .filter((m) => m.orderCount > 0)
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5);
  }, [items, month]);

  return { topMenus, isLoading };
}

/**
 * Row actions for menu items: status change, duplicate, show/hide and delete.
 * Each invalidates the menu queries on success and toasts the outcome.
 */
export function useMenuItemActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [MENU_QUERY_KEY] });
  const onError = (fallback: string) => (error: unknown) =>
    toast.error(handleAxiosError(error as AxiosError) || fallback);

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: MenuStatus }) =>
      api.patch(`${SERVER_URL}/menu/menu-items/${id}`, { status }),
    onSuccess: () => {
      toast.success("Status updated");
      invalidate();
    },
    onError: onError("Failed to update status"),
  });

  const duplicate = useMutation({
    mutationFn: (id: string) => api.post(`${SERVER_URL}/menu/menu-items/${id}/duplicate`),
    onSuccess: invalidate,
    onError: onError("Failed to duplicate item"),
  });

  const toggleHidden = useMutation({
    mutationFn: (id: string) => api.patch(`${SERVER_URL}/menu/menu-items/${id}/toggle-hidden`),
    onSuccess: () => {
      toast.success("Visibility updated");
      invalidate();
    },
    onError: onError("Failed to change visibility"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`${SERVER_URL}/menu/menu-items/${id}`),
    onSuccess: () => {
      toast.success("Item deleted");
      invalidate();
    },
    onError: onError("Failed to delete item"),
  });

  return { updateStatus, duplicate, toggleHidden, remove };
}

export interface PublicMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tag?: string;
  image?: string;
  availability: string;
  bestSeller: boolean;
}

const AVAILABILITY_LABELS: Record<string, string> = {
  ALWAYS_AVAILABLE: "Always available",
  SCHEDULED: "Specific days/time",
  UNAVAILABLE: "Unavailable",
};

/**
 * Data for the public menu page (`/preview/menu`).
 *
 * There is no public menu endpoint yet. When the merchant is signed in (previewing their own page)
 * this shows their real available, visible items and business name. Anyone else — e.g. a diner who
 * scanned a table QR — sees SAMPLE DATA (`isSample: true`) until the backend exposes a public menu.
 */
export function usePublicMenu() {
  const { isAuthenticated, user } = useReduxAuth();
  const { kyc } = useKyc({ enabled: isAuthenticated });

  const { data, isLoading } = useQuery<PublicMenuItem[] | null>({
    queryKey: ["public-menu", isAuthenticated],
    queryFn: async () => {
      if (!isAuthenticated) return mockResponse(null);
      try {
        const response = await api.get(`${SERVER_URL}/menu/menu-items`, {
          params: { page: 1, limit: 100, status: "AVAILABLE" },
        });
        return ((response.data.data?.data ?? []) as Menu[])
          .filter((m) => m.status === "AVAILABLE" && !m.isHidden)
          .map((m) => ({
            id: m.id!,
            name: m.name,
            description: m.description,
            price: m.price,
            category: categoryLabel(m.category),
            tag: m.tag || undefined,
            image: m.images?.[0],
            availability: AVAILABILITY_LABELS[m.availabilityType] ?? "Always available",
            bestSeller: m.tag?.toLowerCase() === "best seller",
          }));
      } catch (error) {
        console.log("Error fetching menu for preview:", error);
        return null;
      }
    },
  });

  const isSample = !data;
  return {
    business: isSample
      ? SAMPLE_PUBLIC_MENU.business
      : kyc?.companyName || user?.fullName || "Your restaurant",
    items: data ?? SAMPLE_PUBLIC_MENU.items,
    isSample,
    isLoading,
  };
}
