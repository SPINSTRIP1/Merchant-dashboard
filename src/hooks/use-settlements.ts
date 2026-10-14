import { useQuery } from "@tanstack/react-query";
import { mockResponse } from "@/mocks/utils";
import { mockLedger, type MockTransaction, type TransactionType } from "@/mocks/transactions";

export type SettledTransaction = MockTransaction & { settledAt: string };

export interface SettlementBatch {
  /** Settlement day, "YYYY-MM-DD" (local time). */
  date: string;
  count: number;
  amount: number;
  byType: Partial<Record<TransactionType, number>>;
}

export interface SettlementsData {
  rows: SettledTransaction[];
  batches: SettlementBatch[];
}

const dayKey = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function computeSettlements(): SettlementsData {
  const rows = mockLedger()
    .transactions.filter((t): t is SettledTransaction => t.settled && !!t.settledAt)
    .sort((a, b) => b.settledAt.localeCompare(a.settledAt));

  const byDay = new Map<string, SettlementBatch>();
  rows.forEach((t) => {
    const date = dayKey(t.settledAt);
    const batch = byDay.get(date) ?? { date, count: 0, amount: 0, byType: {} };
    batch.count += 1;
    batch.amount += t.amount;
    batch.byType[t.type] = (batch.byType[t.type] ?? 0) + 1;
    byDay.set(date, batch);
  });

  return { rows, batches: [...byDay.values()].sort((a, b) => b.date.localeCompare(a.date)) };
}

/**
 * Settled transactions (newest settlement first) and daily settlement batches.
 * Transactions settle T+1 — the business day after payment.
 *
 * SAMPLE DATA from src/mocks/transactions.ts until the backend exposes settlements; swap the
 * `queryFn` for the real endpoint when it exists.
 */
export function useSettlements() {
  const { data, isLoading, error, refetch } = useQuery<SettlementsData>({
    queryKey: ["settlements"],
    queryFn: () => mockResponse(computeSettlements()),
  });

  return {
    rows: data?.rows ?? [],
    batches: data?.batches ?? [],
    isLoading,
    error,
    refetch,
  };
}
