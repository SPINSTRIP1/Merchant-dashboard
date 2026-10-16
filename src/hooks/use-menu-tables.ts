/**
 * The restaurant's dining tables for Menu → Tables & QR. Each table's QR code opens the public menu
 * with its table number (`places.spinstrip.com/restaurants/{merchantId}?number=7`), and orders placed
 * from it carry that number (see use-menu-orders.ts for the real per-table activity).
 *
 * The Menu service has no table entity, so the list itself is kept in this browser (localStorage)
 * until a tables endpoint exists — see docs/backend-endpoints-needed.md (B5).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockId } from "@/mocks/utils";

export interface DiningTable {
  id: string;
  label: string;
  seats: number;
  createdAt: string;
}

const STORAGE_KEY = "spinstrip:menu-tables";
const TABLES_KEY = ["menu-tables"];

function readTables(): DiningTable[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as DiningTable[]) : [];
  } catch {
    return [];
  }
}

function writeTables(tables: DiningTable[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
  } catch {
    // Storage blocked or full: the change lasts for this session only.
  }
}

const naturalOrder = (a: DiningTable, b: DiningTable) =>
  a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: "base" });

/** Dining tables (saved in this browser) with add / remove. */
export function useMenuTables() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<DiningTable[]>({
    queryKey: TABLES_KEY,
    queryFn: () => readTables().sort(naturalOrder),
    staleTime: Infinity,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: TABLES_KEY });

  const createTable = useMutation({
    mutationFn: async ({ label, seats }: { label: string; seats: number }) => {
      const name = label.trim();
      const tables = readTables();
      if (tables.some((t) => t.label.toLowerCase() === name.toLowerCase())) {
        throw new Error(`${name} already exists`);
      }
      const table: DiningTable = { id: mockId("tbl"), label: name, seats, createdAt: new Date().toISOString() };
      writeTables([...tables, table]);
      return table;
    },
    onSuccess: invalidate,
  });

  const deleteTable = useMutation({
    mutationFn: async (id: string) => writeTables(readTables().filter((t) => t.id !== id)),
    onSuccess: invalidate,
  });

  return { tables: data ?? [], isLoading, createTable, deleteTable };
}
