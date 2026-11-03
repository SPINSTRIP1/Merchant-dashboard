/**
 * Settlements from the Menu service. An order counts as settled once its payment is confirmed
 * (CONFIRMED, PROCESSING or COMPLETED); `settledOn` is that time. Every figure — totals, period
 * buckets, daily cards — comes from the API.
 *   GET /menu/settlements             settled orders, paged, with a summary and daily breakdown
 *   GET /menu/settlements/analytics   last 7 / 30 days, this / last month (+ custom window), daily cards
 */
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";

export interface Settlement {
  /** Order receipt code, e.g. "SS-FF29D3". */
  reference: string;
  /** Product line, e.g. "Menu". */
  type: string;
  /** First item, e.g. "Jollof Rice +2 more". */
  item: string;
  customer: string;
  amount: number;
  currency: string;
  settledOn: string;
  /** e.g. "Settled". */
  status: string;
  orderId: string;
}

export interface SettlementDay {
  /** "YYYY-MM-DD". */
  date: string;
  count: number;
  totalAmount: number;
}

export interface SettlementTotals {
  count: number;
  totalAmount: number;
  from: string | null;
  to: string | null;
}

export type SettlementPeriod = "last7Days" | "last30Days" | "thisMonth" | "lastMonth" | "custom";

interface RangeOptions {
  from?: Date | null;
  to?: Date | null;
}

const rangeParams = ({ from, to }: RangeOptions) => ({
  ...(from && { from: from.toISOString() }),
  ...(to && { to: to.toISOString() }),
});

const num = (value: unknown) => Number(value) || 0;

const toDay = (raw: Record<string, unknown>): SettlementDay => ({
  date: String(raw.date),
  count: num(raw.count),
  totalAmount: num(raw.totalAmount),
});

/**
 * One page of settled orders, newest first. `summary` and `days` cover the whole filtered window,
 * not just this page. `search` matches reference, customer or item.
 */
export function useSettlements({
  page = 1,
  limit = 20,
  from,
  to,
  search,
}: RangeOptions & { page?: number; limit?: number; search?: string } = {}) {
  const { data, isLoading } = useQuery({
    queryKey: ["settlements", page, limit, from?.toISOString(), to?.toISOString(), search ?? ""],
    queryFn: async () => {
      try {
        const response = await api.get(`${SERVER_URL}/menu/settlements`, {
          params: { page, limit, ...rangeParams({ from, to }), ...(search?.trim() && { search: search.trim() }) },
        });
        const d = response.data?.data ?? {};
        return {
          settlements: ((d.data ?? []) as Record<string, unknown>[]).map(
            (row): Settlement => ({
              reference: String(row.reference ?? ""),
              type: String(row.type ?? "Menu"),
              item: String(row.item ?? ""),
              customer: String(row.customer ?? "Guest"),
              amount: num(row.amount),
              currency: String(row.currency ?? "NGN"),
              settledOn: String(row.settledOn ?? ""),
              status: String(row.status ?? "Settled"),
              orderId: String(row.orderId ?? row.reference),
            }),
          ),
          summary: { count: num(d.summary?.count), totalAmount: num(d.summary?.totalAmount) },
          days: ((d.dailyBreakdown ?? []) as Record<string, unknown>[]).map(toDay),
          total: num(d.count),
          lastPage: num(d.lastpage) || 1,
        };
      } catch (error) {
        console.log("Error fetching settlements:", error);
        return null;
      }
    },
    placeholderData: keepPreviousData,
  });

  return {
    settlements: data?.settlements ?? [],
    summary: data?.summary ?? { count: 0, totalAmount: 0 },
    days: data?.days ?? [],
    total: data?.total ?? 0,
    lastPage: data?.lastPage ?? 1,
    isLoading,
  };
}

/** Settlement totals by period, plus daily cards for the last `dailyDays` days (max 31). */
export function useSettlementAnalytics({ dailyDays = 7, from, to }: RangeOptions & { dailyDays?: number } = {}) {
  const { data, isLoading } = useQuery({
    queryKey: ["settlement-analytics", dailyDays, from?.toISOString(), to?.toISOString()],
    queryFn: async () => {
      try {
        const response = await api.get(`${SERVER_URL}/menu/settlements/analytics`, {
          params: { dailyDays, ...rangeParams({ from, to }) },
        });
        const d = response.data?.data ?? {};
        const periods = (d.periods ?? {}) as Record<string, Record<string, unknown>>;
        return {
          periods: Object.fromEntries(
            Object.entries(periods).map(([key, p]) => [
              key,
              {
                count: num(p.count),
                totalAmount: num(p.totalAmount),
                from: (p.from as string) ?? null,
                to: (p.to as string) ?? null,
              },
            ]),
          ) as Partial<Record<SettlementPeriod, SettlementTotals>>,
          days: ((d.dailyBreakdown ?? []) as Record<string, unknown>[]).map(toDay),
        };
      } catch (error) {
        console.log("Error fetching settlement analytics:", error);
        return null;
      }
    },
  });

  return { periods: data?.periods ?? {}, days: data?.days ?? [], isLoading };
}
