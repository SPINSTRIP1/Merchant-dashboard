import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockId, mockResponse } from "@/mocks/utils";
import {
  randomQrToken,
  seatingsCollection,
  tablesCollection,
  type DiningTable,
  type Seating,
} from "@/mocks/menu-tables";
import { mockLedger, type MockTransaction } from "@/mocks/transactions";

export type { DiningTable, Seating };

export interface TableSummary extends DiningTable {
  totalSeatings: number;
  totalGuests: number;
  lastSeatedAt: string | null;
  /** Menu orders placed from this table (any status). */
  txnCount: number;
  /** Sum of successful menu orders from this table. */
  revenue: number;
}

export interface TableDetail {
  table: DiningTable;
  seatings: Seating[];
  transactions: MockTransaction[];
}

const TABLES_KEY = ["menu-tables"];

function summarise(table: DiningTable): TableSummary {
  const seatings = seatingsCollection.snapshot().filter((s) => s.tableId === table.id);
  const orders = mockLedger().transactions.filter((t) => t.type === "menu" && t.tableId === table.id);
  return {
    ...table,
    totalSeatings: seatings.length,
    totalGuests: seatings.reduce((sum, s) => sum + s.guests, 0),
    lastSeatedAt: seatings[0]?.seatedAt ?? null,
    txnCount: orders.length,
    revenue: orders.filter((t) => t.status === "success").reduce((sum, t) => sum + t.amount, 0),
  };
}

/**
 * The restaurant's dining tables with all-time activity (seatings, guests, orders, revenue).
 * SAMPLE DATA (src/mocks/menu-tables.ts) until table endpoints exist; create/delete persist in
 * memory for the session.
 */
export function useMenuTables() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<TableSummary[]>({
    queryKey: TABLES_KEY,
    queryFn: async () => (await tablesCollection.list()).map(summarise),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: TABLES_KEY });

  const createTable = useMutation({
    mutationFn: ({ label, seats }: { label: string; seats: number }) =>
      tablesCollection.create({
        id: mockId("tbl"),
        label: label.trim(),
        seats,
        qrToken: randomQrToken(),
        createdAt: new Date().toISOString(),
      }),
    onSuccess: invalidate,
  });

  const deleteTable = useMutation({
    mutationFn: (id: string) => tablesCollection.remove(id),
    onSuccess: invalidate,
  });

  return { tables: data ?? [], isLoading, error, refetch, createTable, deleteTable };
}

/** One table's last 50 orders and seatings, newest first. SAMPLE DATA (see `useMenuTables`). */
export function useTableDetail(tableId: string | null) {
  const { data, isLoading, error } = useQuery<TableDetail | null>({
    queryKey: [...TABLES_KEY, "detail", tableId],
    queryFn: () => {
      const table = tablesCollection.snapshot().find((t) => t.id === tableId);
      if (!table) return mockResponse(null);
      return mockResponse({
        table,
        seatings: seatingsCollection.snapshot().filter((s) => s.tableId === tableId).slice(0, 50),
        transactions: mockLedger()
          .transactions.filter((t) => t.type === "menu" && t.tableId === tableId)
          .slice(0, 50),
      });
    },
    enabled: !!tableId,
  });

  return { detail: data ?? null, isLoading, error };
}

/** Records guests being seated at a table (used by the waiter app). SAMPLE DATA. */
export function useSeatGuests() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tableId, guests }: { tableId: string; guests: number }) =>
      seatingsCollection.create({
        id: mockId("seat"),
        tableId,
        guests,
        seatedAt: new Date().toISOString(),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TABLES_KEY }),
  });
}

/** Resolves a table QR token (`?table=` on the public menu) to its table. SAMPLE DATA. */
export function useTableByToken(token: string | null) {
  const { data } = useQuery<DiningTable | null>({
    queryKey: [...TABLES_KEY, "by-token", token],
    queryFn: () => mockResponse(tablesCollection.snapshot().find((t) => t.qrToken === token) ?? null, 0),
    enabled: !!token,
  });
  return { table: data ?? null };
}

export interface FloorTable extends DiningTable {
  guestsToday: number;
  /** Menu orders from this table today that haven't completed yet. */
  openOrders: number;
  /** Seated within the last 90 minutes. */
  occupied: boolean;
  lastSeatedAt: string | null;
}

const OCCUPIED_FOR_MS = 90 * 60 * 1000;

/**
 * The waiter's live floor plan: today's guests and open orders per table, refreshed every 15s.
 * SAMPLE DATA (see `useMenuTables`); shares the same tables and seatings.
 */
export function useWaiterFloor() {
  const { data, isLoading, dataUpdatedAt } = useQuery<FloorTable[]>({
    queryKey: [...TABLES_KEY, "floor"],
    queryFn: async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const now = Date.now();
      const seatings = seatingsCollection.snapshot();
      const todaysOrders = mockLedger().transactions.filter(
        (t) => t.type === "menu" && new Date(t.createdAt) >= startOfDay
      );
      return (await tablesCollection.list()).map((table) => {
        const tableSeatings = seatings.filter((s) => s.tableId === table.id);
        const today = tableSeatings.filter((s) => new Date(s.seatedAt) >= startOfDay);
        const last = tableSeatings[0]?.seatedAt ?? null;
        return {
          ...table,
          guestsToday: today.reduce((sum, s) => sum + s.guests, 0),
          openOrders: todaysOrders.filter((t) => t.tableId === table.id && t.status === "pending").length,
          occupied: !!last && now - new Date(last).getTime() < OCCUPIED_FOR_MS,
          lastSeatedAt: last,
        };
      });
    },
    refetchInterval: 15_000,
  });

  return { tables: data ?? [], isLoading, updatedAt: dataUpdatedAt };
}
