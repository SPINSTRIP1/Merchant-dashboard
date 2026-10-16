/**
 * Wallet activity and money movement, added with the prototype port alongside the original wallet
 * hooks (use-wallet, use-bank-accounts), which are untouched. All calls go to the user-account
 * service: transaction history, bank payouts (withdrawals) and the wallet PIN.
 */
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { USER_ACCOUNT_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import { handleAxiosError } from "@/lib/api/handle-axios-error";
import { MOCK_WALLET_BALANCE } from "@/mocks/transactions";
import { rangeFor, type RangePreset } from "@/utils";

export type WalletPeriod = Extract<RangePreset, "week" | "month" | "year">;

export type WalletEntry = "CREDIT" | "DEBIT";
export type WalletTxKind = "FUNDING" | "TRANSFER" | "BANK_PAYOUT";
export type WalletTxStatus = "completed" | "pending" | "failed";

export interface WalletTransaction {
  id: string;
  /** Ledger reference (txn_ref), or the id when there is none. */
  ref: string;
  entry: WalletEntry;
  kind: WalletTxKind;
  /** "Wallet funding", "Transfer", "Withdrawal to bank". */
  label: string;
  counterparty: string | null;
  narration: string | null;
  amount: number;
  status: WalletTxStatus;
  createdAt: string;
}

const KIND_LABELS: Record<WalletTxKind, string> = {
  FUNDING: "Wallet funding",
  TRANSFER: "Transfer",
  BANK_PAYOUT: "Withdrawal to bank",
};

const text = (value: unknown) => (typeof value === "string" && value ? value : value != null ? String(value) : null);

function toTransaction(raw: Record<string, unknown>): WalletTransaction {
  const kind = (String(raw.type ?? "TRANSFER").toUpperCase() as WalletTxKind) || "TRANSFER";
  const status = String(raw.status ?? "PENDING").toLowerCase();
  return {
    id: String(raw.id),
    ref: text(raw.reference) ?? String(raw.id),
    entry: String(raw.entry ?? "CREDIT").toUpperCase() === "DEBIT" ? "DEBIT" : "CREDIT",
    kind,
    label: KIND_LABELS[kind] ?? kind,
    counterparty: text(raw.counterparty),
    narration: text(raw.narration),
    amount: Number(raw.amount) || 0,
    status: status === "completed" || status === "failed" ? status : "pending",
    createdAt: String(raw.createdAt),
  };
}

const ymd = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const WALLET_HISTORY_KEY = ["wallet-transaction-history"];

/**
 * The wallet's transactions for a period (`GET /wallet/transaction-history`, newest first, up to
 * 1,000) with money-in / withdrawal totals and a chart series of money in.
 */
export function useWalletActivity(period: WalletPeriod) {
  const { from, to } = rangeFor(period);
  const { data, isLoading } = useQuery<WalletTransaction[]>({
    queryKey: [...WALLET_HISTORY_KEY, period],
    queryFn: async () => {
      try {
        const response = await api.get(`${USER_ACCOUNT_URL}/wallet/transaction-history`, {
          params: {
            currency: "NGN",
            sort: "descending",
            start_limit: 1,
            end_limit: 1000,
            date_from: ymd(from),
            date_to: ymd(to),
          },
        });
        const rows = (response.data?.data?.transactions ?? []) as Record<string, unknown>[];
        return rows.map(toTransaction);
      } catch (error) {
        console.log("Error fetching wallet history:", error);
        return [];
      }
    },
  });

  return useMemo(() => {
    const transactions = data ?? [];
    const completed = transactions.filter((t) => t.status === "completed");
    const moneyIn = completed.filter((t) => t.entry === "CREDIT").reduce((sum, t) => sum + t.amount, 0);
    const funding = completed.filter((t) => t.kind === "FUNDING").reduce((sum, t) => sum + t.amount, 0);
    const withdrawn = completed.filter((t) => t.kind === "BANK_PAYOUT").reduce((sum, t) => sum + t.amount, 0);

    // Year → monthly buckets; week/month → daily buckets of money in.
    const { from: start, to: end } = rangeFor(period);
    const monthly = period === "year";
    const buckets: { key: string; label: string; revenue: number }[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
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
    completed
      .filter((t) => t.entry === "CREDIT")
      .forEach((t) => {
        const d = new Date(t.createdAt);
        const key = monthly ? `${d.getFullYear()}-${d.getMonth()}` : `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        const bucket = byKey.get(key);
        if (bucket) bucket.revenue += t.amount;
      });

    return { transactions, moneyIn, funding, withdrawn, series: buckets, isLoading };
  }, [data, isLoading, period]);
}

/** Sample balance shown only when the wallet response doesn't include one. */
export const SAMPLE_WALLET_BALANCE = MOCK_WALLET_BALANCE;

// --- Wallet PIN ------------------------------------------------------------------

const PIN_KEY = ["wallet-pin-status"];
const failure = (error: unknown) => new Error(handleAxiosError(error as AxiosError));

/**
 * Whether the merchant has a wallet PIN (`GET /pin/status`), plus requesting the emailed OTP
 * (`POST /pin/otp`) and creating (`POST /pin`) or resetting (`PATCH /pin`) the PIN with it.
 */
export function useWalletPin() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<{ hasPin: boolean | null; blocker: string | null }>({
    queryKey: PIN_KEY,
    queryFn: async () => {
      try {
        const response = await api.get(`${USER_ACCOUNT_URL}/pin/status`);
        const body = response.data?.data;
        if (typeof body === "boolean") return { hasPin: body, blocker: null };
        const flag = body?.hasPin ?? body?.isSet ?? body?.pinSet ?? body?.hasWalletPin ?? body?.status;
        return { hasPin: typeof flag === "boolean" ? flag : null, blocker: null };
      } catch (error) {
        // e.g. 400 "Create a wallet before managing your PIN" when the wallet isn't fully set up.
        const status = (error as AxiosError).response?.status;
        return { hasPin: null, blocker: status === 400 ? handleAxiosError(error as AxiosError) : null };
      }
    },
  });

  const requestOtp = useMutation({
    mutationFn: async () => {
      try {
        await api.post(`${USER_ACCOUNT_URL}/pin/otp`);
      } catch (error) {
        throw failure(error);
      }
    },
  });

  const savePin = useMutation({
    mutationFn: async ({ pin, otpCode, reset }: { pin: string; otpCode: string; reset: boolean }) => {
      try {
        if (reset) await api.patch(`${USER_ACCOUNT_URL}/pin`, { pin, otpCode });
        else await api.post(`${USER_ACCOUNT_URL}/pin`, { pin, otpCode });
      } catch (error) {
        throw failure(error);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PIN_KEY }),
  });

  return {
    /** `null` when the status couldn't be read; the withdraw flow then just asks for the PIN. */
    hasPin: data?.hasPin ?? null,
    /** Why PINs (and so withdrawals) can't be used yet, as the API puts it; null when they can. */
    blocker: data?.blocker ?? null,
    isLoading,
    requestOtp,
    savePin,
  };
}

// --- Withdrawals ------------------------------------------------------------------

export interface WithdrawInput {
  amount: number;
  bankCode: string;
  bankAccountNumber: string;
  walletPin: string;
}

/**
 * Withdraws to a bank account: creates a BANK_TRANSFER payout (`POST /payouts`), then authorizes
 * it with the returned auth token and the wallet PIN (`POST /payouts/{id}/authorize`).
 */
export function useWithdraw() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ amount, bankCode, bankAccountNumber, walletPin }: WithdrawInput) => {
      let payout: Record<string, unknown>;
      try {
        const response = await api.post(`${USER_ACCOUNT_URL}/payouts`, {
          amount,
          currency: "NGN",
          paymentType: "BANK_TRANSFER",
          bankCode,
          bankAccountNumber,
        });
        payout = (response.data?.data ?? {}) as Record<string, unknown>;
      } catch (error) {
        throw failure(error);
      }
      const nested = (payout.payout ?? {}) as Record<string, unknown>;
      const payoutId = text(payout.id) ?? text(payout.payoutId) ?? text(nested.id);
      const authToken = text(payout.authToken) ?? text(nested.authToken);
      if (!payoutId) throw new Error("The withdrawal couldn't be started. Please try again.");
      try {
        const response = await api.post(`${USER_ACCOUNT_URL}/payouts/${payoutId}/authorize`, {
          ...(authToken && { authToken }),
          walletPin,
        });
        return response.data?.data;
      } catch (error) {
        throw failure(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALLET_HISTORY_KEY });
      queryClient.invalidateQueries({ queryKey: ["user-wallets"] });
    },
  });
}
