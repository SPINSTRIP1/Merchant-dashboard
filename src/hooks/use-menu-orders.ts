/**
 * The shape of a menu order (`GET /menu/orders` rows), helpers for reading one, and the paged order
 * history. Figures (revenue, sales, per-table totals) come from the analytics endpoints — see
 * use-menu-analytics.ts.
 */
import { keepPreviousData, useQuery } from "@tanstack/react-query";
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
  /** PENDING (awaiting payment) | CONFIRMED (paid) | PROCESSING (a waiter has it) | COMPLETED | CANCELLED | FAILED */
  status: string;
  /** Dine-in table; null for takeaway. */
  tableNumber: string | null;
  waiterUserId: string | null;
  /** ACCEPTED while a waiter is handling it. */
  waiterAssignment: string | null;
  items: MenuOrderItem[];
  createdAt: string;
  /** When the order was completed or cancelled; null until then. */
  completedAt: string | null;
  cancelledAt: string | null;
  email: string | null;
  phone: string | null;
  paymentMethod: string | null;
  /** Payment provider reference. */
  transactionRef: string | null;
  /**
   * Settlement of the table's share to the table's payout account. `status` is NOT_APPLICABLE when
   * the table had no payout account (or the order was takeaway).
   */
  tablePayout: {
    status: string;
    amount: number | null;
    settledAt: string | null;
    paymentRef: string | null;
    txnRef: string | null;
    audit: unknown;
  };
}

export type MenuOrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "COMPLETED" | "CANCELLED" | "FAILED";

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Awaiting payment",
  CONFIRMED: "Paid",
  PROCESSING: "With a waiter",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  FAILED: "Failed",
};

/** Paid and being handled by a waiter (PROCESSING; older orders: CONFIRMED + ACCEPTED). */
export const isInProgress = (order: MenuOrder) =>
  order.status === "PROCESSING" || (order.status === "CONFIRMED" && order.waiterAssignment === "ACCEPTED");

const num = (value: unknown) => Number(value) || 0;
const str = (value: unknown) => (typeof value === "string" && value ? value : null);

/** One `GET /menu/orders` row, normalised. */
export function toOrder(raw: Record<string, unknown>): MenuOrder {
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
    completedAt: str(raw.completedAt),
    cancelledAt: str(raw.cancelledAt),
    email: str(raw.email),
    phone: str(raw.phone),
    paymentMethod: str(raw.paymentMethod),
    transactionRef: str(raw.transactionRef),
    tablePayout: {
      status: (str(raw.tablePayoutStatus) ?? "NOT_APPLICABLE").toUpperCase(),
      amount: raw.tablePayoutAmount == null ? null : num(raw.tablePayoutAmount),
      settledAt: str(raw.tablePayoutSettledAt),
      paymentRef: str(raw.tablePayoutPaymentRef),
      txnRef: str(raw.tablePayoutTxnRef),
      audit: raw.tablePayoutAudit ?? null,
    },
  };
}

/**
 * The merchant's order history, newest first: every order whatever its status, paged on the server.
 * Wraps `GET /menu/orders?page&limit&status&tableNumber`; `status` and `tableNumber` (exact match)
 * are optional. The API has no date or text search yet.
 */
export function useMenuOrders({
  page = 1,
  limit = 20,
  status,
  tableNumber,
}: { page?: number; limit?: number; status?: MenuOrderStatus | null; tableNumber?: string } = {}) {
  const table = tableNumber?.trim() ?? "";
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["menu-orders", "history", page, limit, status ?? "ALL", table],
    queryFn: async () => {
      try {
        const response = await api.get(`${SERVER_URL}/menu/orders`, {
          params: { page, limit, ...(status && { status }), ...(table && { tableNumber: table }) },
        });
        const body = response.data?.data ?? {};
        const rows = (body.data ?? []) as Record<string, unknown>[];
        const total = Number(body.count) || 0;
        return {
          orders: rows.map(toOrder),
          total,
          lastPage: Number(body.lastpage ?? body.lastPage) || Math.max(1, Math.ceil(total / limit)),
        };
      } catch (error) {
        console.log("Error fetching menu orders:", error);
        return null;
      }
    },
    placeholderData: keepPreviousData,
  });

  return {
    orders: data?.orders ?? [],
    total: data?.total ?? 0,
    lastPage: data?.lastPage ?? 1,
    isLoading,
    isFetching,
    error,
    refetch,
  };
}
