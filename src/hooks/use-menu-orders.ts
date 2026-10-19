/**
 * The shape of a menu order (`GET /menu/orders` rows) and helpers for reading one. Figures (revenue,
 * sales, per-table totals) come from the analytics endpoints — see use-menu-analytics.ts.
 */

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
}

/** Paid orders count towards revenue and best-sellers. */
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
  };
}
