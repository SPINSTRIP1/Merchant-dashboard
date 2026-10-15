/**
 * Wallet figures from the prototype that the backend doesn't report yet: revenue, inflow and
 * withdrawal totals, the revenue chart and transaction history. SAMPLE DATA drawn from the same
 * ledger as Overview and Settlement (src/mocks/transactions.ts), so the numbers agree across pages.
 * The existing wallet hooks (use-wallet, use-bank-accounts) are untouched.
 */
import { useMemo } from "react";
import { MOCK_WALLET_BALANCE, mockLedger, type MockTransaction } from "@/mocks/transactions";
import { rangeFor, type RangePreset } from "@/utils";

export type WalletPeriod = Extract<RangePreset, "week" | "month" | "year">;

export interface WalletTransaction extends MockTransaction {
  paymentMethod: "Wallet" | "Card" | "Bank Transfer" | "POS";
}

const METHODS: WalletTransaction["paymentMethod"][] = ["Card", "Bank Transfer", "Wallet", "POS"];

/** Transactions in a period (newest first) with a payment method attached. SAMPLE DATA. */
function transactionsIn(period: WalletPeriod): WalletTransaction[] {
  const { from, to } = rangeFor(period);
  return mockLedger()
    .transactions.filter((t) => {
      const time = new Date(t.createdAt).getTime();
      return time >= from.getTime() && time <= to.getTime();
    })
    .map((t, i) => ({ ...t, paymentMethod: t.type === "wallet" ? "Wallet" : METHODS[i % METHODS.length] }));
}

/** Revenue/inflow/withdrawal totals, the revenue series and transactions for a period. SAMPLE DATA. */
export function useWalletActivity(period: WalletPeriod) {
  return useMemo(() => {
    const transactions = transactionsIn(period);
    const successful = transactions.filter((t) => t.status === "success");
    const revenue = successful.reduce((sum, t) => sum + t.amount, 0);
    const inflow = successful.filter((t) => t.type === "wallet").reduce((sum, t) => sum + t.amount, 0);
    // Settled payouts stand in for withdrawals to the merchant's bank.
    const withdrawn = transactions.filter((t) => t.settled).reduce((sum, t) => sum + t.amount, 0);

    // Year → monthly buckets; week/month → daily buckets.
    const { from, to } = rangeFor(period);
    const monthly = period === "year";
    const buckets: { key: string; label: string; revenue: number }[] = [];
    const cursor = new Date(from);
    while (cursor <= to) {
      const key = monthly
        ? `${cursor.getFullYear()}-${cursor.getMonth()}`
        : `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
      buckets.push({
        key,
        label: monthly
          ? cursor.toLocaleDateString("en-NG", { month: "short" }).toUpperCase()
          : cursor.toLocaleDateString("en-NG", period === "week" ? { weekday: "short" } : { day: "numeric", month: "short" }),
        revenue: 0,
      });
      if (monthly) cursor.setMonth(cursor.getMonth() + 1);
      else cursor.setDate(cursor.getDate() + 1);
    }
    const byKey = new Map(buckets.map((b) => [b.key, b]));
    successful.forEach((t) => {
      const d = new Date(t.createdAt);
      const key = monthly ? `${d.getFullYear()}-${d.getMonth()}` : `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const bucket = byKey.get(key);
      if (bucket) bucket.revenue += t.amount;
    });

    return { transactions, revenue, inflow, withdrawn, series: buckets };
  }, [period]);
}

/** Sample balance shown when the wallet response doesn't include one. */
export const SAMPLE_WALLET_BALANCE = MOCK_WALLET_BALANCE;
