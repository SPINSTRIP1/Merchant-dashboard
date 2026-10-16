/**
 * The merchant's menu orders from the Menu service (`GET /menu/orders`), placed by guests on the
 * public site — dine-in orders carry the `tableNumber` from the table QR code. Powers Table
 * Analytics and the Top Menus order counts.
 */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";

export interface MenuOrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  lineTotal: number;
}

export interface MenuOrder {
  id: string;
  /** Receipt code, e.g. "SS-A042B3". */
  displayCode: string;
  customerName: string;
  totalAmount: number;
  /** PENDING (awaiting payment) | CONFIRMED (paid) | COMPLETED | CANCELLED | FAILED */
  status: string;
  /** Dine-in table; null for takeaway. */
  tableNumber: string | null;
  waiterUserId: string | null;
  /** ACCEPTED while a waiter is handling it. */
  waiterAssignment: string | null;
  items: MenuOrderItem[];
  createdAt: string;
}

/** Paid orders count towards revenue and best-sellers. */
export const isPaidOrder = (order: MenuOrder) => order.status === "CONFIRMED" || order.status === "COMPLETED";

const num = (value: unknown) => Number(value) || 0;
const str = (value: unknown) => (typeof value === "string" && value ? value : null);

function toOrder(raw: Record<string, unknown>): MenuOrder {
  const items = Array.isArray(raw.items) ? (raw.items as Record<string, unknown>[]) : [];
  return {
    id: String(raw.id),
    displayCode: str(raw.displayCode) ?? String(raw.id).slice(0, 8).toUpperCase(),
    customerName: str(raw.customerName) ?? "Guest",
    totalAmount: num(raw.totalAmount ?? raw.subtotal),
    status: String(raw.status ?? "PENDING").toUpperCase(),
    tableNumber: str(raw.tableNumber)?.trim() || null,
    waiterUserId: str(raw.waiterUserId),
    waiterAssignment: str(raw.waiterAssignment),
    items: items.map((item) => ({
      menuItemId: String(item.menuItemId ?? ""),
      name: str(item.name) ?? "Item",
      quantity: num(item.quantity) || 1,
      lineTotal: num(item.lineTotal),
    })),
    createdAt: String(raw.createdAt),
  };
}

const PAGE_SIZE = 100;
/** Enough history for analytics without paging through everything (5 × 100 orders). */
const MAX_PAGES = 5;

/** The merchant's most recent orders (up to 500), newest first. */
export function useMenuOrders() {
  const { data, isLoading, error, refetch } = useQuery<{ orders: MenuOrder[]; total: number }>({
    queryKey: ["menu-orders"],
    queryFn: async () => {
      const orders: MenuOrder[] = [];
      let total = 0;
      try {
        for (let page = 1; page <= MAX_PAGES; page++) {
          const response = await api.get(`${SERVER_URL}/menu/orders`, { params: { page, limit: PAGE_SIZE } });
          const body = response.data?.data ?? {};
          const rows = (Array.isArray(body) ? body : body.data ?? []) as Record<string, unknown>[];
          total = Number(body.count) || total || rows.length;
          orders.push(...rows.map(toOrder));
          const last = Number(body.lastpage) || 1;
          if (rows.length < PAGE_SIZE || page >= last) break;
        }
      } catch (error) {
        console.log("Error fetching menu orders:", error);
      }
      orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return { orders, total: Math.max(total, orders.length) };
    },
    refetchInterval: 60_000,
  });

  return {
    orders: data?.orders ?? [],
    total: data?.total ?? 0,
    /** True when there are more orders than were loaded for analytics. */
    isTruncated: (data?.total ?? 0) > (data?.orders.length ?? 0),
    isLoading,
    error,
    refetch,
  };
}

export interface TableOrderStats {
  /** Table number as entered on the QR link; "" groups takeaway orders. */
  tableNumber: string;
  orders: MenuOrder[];
  orderCount: number;
  paidCount: number;
  itemsSold: number;
  revenue: number;
  averageOrder: number;
  /** Orders a waiter is handling right now. */
  inProgress: number;
  topItem: string | null;
  lastOrderAt: string | null;
}

const naturalOrder = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });

/** Orders grouped by table number (takeaway last), with per-table totals. */
export function useTableOrderStats() {
  const { orders, total, isTruncated, isLoading } = useMenuOrders();

  const tables = useMemo<TableOrderStats[]>(() => {
    const groups = new Map<string, MenuOrder[]>();
    orders.forEach((order) => {
      const key = order.tableNumber ?? "";
      groups.set(key, [...(groups.get(key) ?? []), order]);
    });
    return [...groups.entries()]
      .map(([tableNumber, list]) => {
        const paid = list.filter(isPaidOrder);
        const revenue = paid.reduce((sum, o) => sum + o.totalAmount, 0);
        const counts = new Map<string, number>();
        paid.forEach((o) => o.items.forEach((i) => counts.set(i.name, (counts.get(i.name) ?? 0) + i.quantity)));
        const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
        return {
          tableNumber,
          orders: list,
          orderCount: list.length,
          paidCount: paid.length,
          itemsSold: [...counts.values()].reduce((sum, n) => sum + n, 0),
          revenue,
          averageOrder: paid.length ? revenue / paid.length : 0,
          inProgress: list.filter((o) => o.status === "CONFIRMED" && o.waiterAssignment === "ACCEPTED").length,
          topItem: top?.[0] ?? null,
          lastOrderAt: list[0]?.createdAt ?? null,
        };
      })
      .sort((a, b) => (a.tableNumber === "" ? 1 : b.tableNumber === "" ? -1 : naturalOrder(a.tableNumber, b.tableNumber)));
  }, [orders]);

  const dineIn = tables.filter((t) => t.tableNumber);
  const totals = {
    dineInRevenue: dineIn.reduce((sum, t) => sum + t.revenue, 0),
    takeawayRevenue: tables.find((t) => !t.tableNumber)?.revenue ?? 0,
    busiest: [...dineIn].sort((a, b) => b.paidCount - a.paidCount)[0] ?? null,
  };

  return { tables, totals, totalOrders: total, isTruncated, isLoading };
}

/** Paid units sold per menu item id in a month ("YYYY-MM"), from the loaded orders. */
export function useMenuItemSales(month: string) {
  const { orders, isLoading } = useMenuOrders();
  const sales = useMemo(() => {
    const counts = new Map<string, number>();
    orders
      .filter((o) => isPaidOrder(o) && o.createdAt.startsWith(month))
      .forEach((o) => o.items.forEach((i) => counts.set(i.menuItemId, (counts.get(i.menuItemId) ?? 0) + i.quantity)));
    return counts;
  }, [orders, month]);
  return { sales, isLoading };
}
