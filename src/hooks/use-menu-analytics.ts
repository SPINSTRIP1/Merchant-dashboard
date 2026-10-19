/**
 * Menu analytics from the Menu service. Analytics count paid orders only (pending and
 * failed orders are excluded by the API).
 */
import { useQueries, useQuery } from "@tanstack/react-query";
import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { toOrder, type MenuOrder } from "@/hooks/use-menu-orders";

export interface MenuAnalytics {
  from: string | null;
  to: string | null;
  orderCount: number;
  revenue: number;
  averageOrderValue: number;
  itemsSold: number;
  itemRevenue: number;
}

export interface TableAnalytics {
  tableId: string;
  number: number;
  name: string;
  seats: number;
  /** Distinct customers. */
  guests: number;
  /** Paid orders at the table. */
  seatings: number;
  /** Item quantities on those orders. */
  orders: number;
  /** Latest payment time. */
  lastSeatedAt: string | null;
  revenue: number;
}

interface RangeOptions {
  from?: Date;
  to?: Date;
}

const rangeParams = ({ from, to }: RangeOptions) => ({
  ...(from && { from: from.toISOString() }),
  ...(to && { to: to.toISOString() }),
});

const num = (value: unknown) => Number(value) || 0;

/** Totals for the merchant's menu (`GET /menu/analytics`). The API defaults to the last 30 days. */
export function useMenuAnalytics(range: RangeOptions = {}) {
  const { data, isLoading } = useQuery<MenuAnalytics | null>({
    queryKey: ["menu-analytics", "summary", range.from?.toISOString(), range.to?.toISOString()],
    queryFn: async () => {
      try {
        const response = await api.get(`${SERVER_URL}/menu/analytics`, { params: rangeParams(range) });
        const d = response.data?.data ?? {};
        return {
          from: d.from ?? null,
          to: d.to ?? null,
          orderCount: num(d.orderCount),
          revenue: num(d.revenue),
          averageOrderValue: num(d.averageOrderValue),
          itemsSold: num(d.itemsSold),
          itemRevenue: num(d.itemRevenue),
        };
      } catch (error) {
        console.log("Error fetching menu analytics:", error);
        return null;
      }
    },
  });
  return { analytics: data ?? null, isLoading };
}

/** One card per active table (`GET /menu/analytics/tables`); all time unless a range is given. */
export function useTableAnalytics(range: RangeOptions = {}) {
  const { data, isLoading } = useQuery<TableAnalytics[]>({
    queryKey: ["menu-analytics", "tables", range.from?.toISOString(), range.to?.toISOString()],
    queryFn: async () => {
      try {
        const response = await api.get(`${SERVER_URL}/menu/analytics/tables`, { params: rangeParams(range) });
        const rows = (response.data?.data?.tables ?? []) as TableAnalytics[];
        return rows
          .map((t) => ({ ...t, revenue: num(t.revenue), guests: num(t.guests), seatings: num(t.seatings), orders: num(t.orders) }))
          .sort((a, b) => a.number - b.number);
      } catch (error) {
        console.log("Error fetching table analytics:", error);
        return [];
      }
    },
  });
  return { tables: data ?? [], isLoading };
}

/** One table's figures for a range (`GET /menu/analytics/tables/{tableId}`). */
export function useTableAnalyticsDetail(tableId: string | null, range: RangeOptions = {}) {
  const { data, isLoading } = useQuery<TableAnalytics | null>({
    queryKey: ["menu-analytics", "table", tableId, range.from?.toISOString(), range.to?.toISOString()],
    queryFn: async () => {
      try {
        const response = await api.get(`${SERVER_URL}/menu/analytics/tables/${tableId}`, { params: rangeParams(range) });
        const t = response.data?.data;
        return t ? { ...t, revenue: num(t.revenue), guests: num(t.guests), seatings: num(t.seatings), orders: num(t.orders) } : null;
      } catch (error) {
        console.log("Error fetching table analytics:", error);
        return null;
      }
    },
    enabled: !!tableId,
  });
  return { table: data ?? null, isLoading };
}

export interface ItemSales {
  itemId: string;
  name: string;
  orderCount: number;
  quantitySold: number;
  revenue: number;
}

/**
 * Paid sales per menu item for a range (`GET /menu/analytics/items/{itemId}`, one request per item —
 * the API has no all-items breakdown).
 */
export function useMenuItemsSales(itemIds: string[], range: RangeOptions = {}) {
  const results = useQueries({
    queries: itemIds.map((itemId) => ({
      queryKey: ["menu-analytics", "item", itemId, range.from?.toISOString(), range.to?.toISOString()],
      queryFn: async (): Promise<ItemSales | null> => {
        try {
          const response = await api.get(`${SERVER_URL}/menu/analytics/items/${itemId}`, { params: rangeParams(range) });
          const d = response.data?.data;
          return d
            ? { itemId, name: d.name, orderCount: num(d.orderCount), quantitySold: num(d.quantitySold), revenue: num(d.revenue) }
            : null;
        } catch (error) {
          console.log("Error fetching item analytics:", error);
          return null;
        }
      },
      staleTime: 60_000,
    })),
  });
  return {
    sales: results.map((r) => r.data).filter((d): d is ItemSales => !!d),
    isLoading: results.some((r) => r.isLoading),
  };
}

/** A table's latest orders, newest first (`GET /menu/orders?tableNumber=`; the API has no date filter). */
export function useTableOrders(tableNumber: number | null) {
  const { data, isLoading } = useQuery<{ orders: MenuOrder[]; total: number }>({
    queryKey: ["menu-orders", "table", tableNumber],
    queryFn: async () => {
      try {
        const response = await api.get(`${SERVER_URL}/menu/orders`, {
          params: { page: 1, limit: 100, tableNumber: String(tableNumber) },
        });
        const body = response.data?.data ?? {};
        const rows = (body.data ?? []) as Record<string, unknown>[];
        return { orders: rows.map(toOrder), total: Number(body.count) || rows.length };
      } catch (error) {
        console.log("Error fetching table orders:", error);
        return { orders: [], total: 0 };
      }
    },
    enabled: tableNumber !== null,
  });
  return { orders: data?.orders ?? [], total: data?.total ?? 0, isLoading };
}


