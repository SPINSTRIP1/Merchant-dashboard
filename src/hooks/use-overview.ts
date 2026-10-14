import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useInventoryStats } from "@/hooks/use-inventory";
import { useDealStats } from "@/hooks/use-deals";
import { useEventStats, useRecentEvents } from "@/hooks/use-events";
import { useMenuItemsCount } from "@/hooks/use-menu";
import { usePlacesCount } from "@/hooks/use-places";
import { mockResponse } from "@/mocks/utils";
import {
  MOCK_WALLET_BALANCE,
  TRANSACTION_TYPES,
  mockLedger,
  type MockTransaction,
  type TransactionType,
} from "@/mocks/transactions";

export interface OverviewSeriesPoint {
  key: string;
  label: string;
  revenue: number;
  customers: number;
}

export interface OverviewAnalytics {
  totalCustomers: number;
  newCustomers: number;
  totalTransactions: number;
  revenue: number;
  /** Revenue for the same-length period immediately before the range (for the % change). */
  revenuePrev: number;
  walletBalance: number;
  totalSettlement: number;
  settledCount: number;
  series: OverviewSeriesPoint[];
  /** Revenue and transaction count per product line within the range. */
  performance: { type: TransactionType; revenue: number; count: number }[];
  recentTransactions: MockTransaction[];
}

const DAY_MS = 24 * 60 * 60 * 1000;
const inRange = (iso: string, from: Date, to: Date) => {
  const t = new Date(iso).getTime();
  return t >= from.getTime() && t <= to.getTime();
};

/** Local-time bucket key: "2026-10" (monthly) or "2026-10-14" (daily). */
const bucketKey = (value: string | Date, monthly: boolean) => {
  const d = new Date(value);
  return monthly
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Daily buckets for ranges up to 100 days, monthly beyond that; every bucket present, zero-filled. */
function buildSeries(from: Date, to: Date): OverviewSeriesPoint[] {
  const monthly = (to.getTime() - from.getTime()) / DAY_MS > 100;
  const points: OverviewSeriesPoint[] = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  if (monthly) cursor.setDate(1);

  while (cursor <= to) {
    const key = bucketKey(cursor, monthly);
    const label = monthly
      ? cursor.toLocaleDateString("en-NG", { month: "short", year: "2-digit" })
      : cursor.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
    points.push({ key, label, revenue: 0, customers: 0 });
    if (monthly) cursor.setMonth(cursor.getMonth() + 1);
    else cursor.setDate(cursor.getDate() + 1);
  }
  return points;
}


function computeAnalytics(from: Date, to: Date): OverviewAnalytics {
  const { customers, transactions } = mockLedger();
  const span = to.getTime() - from.getTime();
  const prevFrom = new Date(from.getTime() - span);
  const monthly = span / DAY_MS > 100;

  const txInRange = transactions.filter((t) => inRange(t.createdAt, from, to));
  const successful = txInRange.filter((t) => t.status === "success");
  const settled = txInRange.filter((t) => t.settled);

  const series = buildSeries(from, to);
  const byKey = new Map(series.map((p) => [p.key, p]));
  successful.forEach((t) => {
    const point = byKey.get(bucketKey(t.createdAt, monthly));
    if (point) point.revenue += t.amount;
  });
  customers
    .filter((c) => inRange(c.createdAt, from, to))
    .forEach((c) => {
      const point = byKey.get(bucketKey(c.createdAt, monthly));
      if (point) point.customers += 1;
    });

  return {
    totalCustomers: customers.length,
    newCustomers: customers.filter((c) => inRange(c.createdAt, from, to)).length,
    totalTransactions: txInRange.length,
    revenue: successful.reduce((sum, t) => sum + t.amount, 0),
    revenuePrev: transactions
      .filter((t) => t.status === "success" && inRange(t.createdAt, prevFrom, from))
      .reduce((sum, t) => sum + t.amount, 0),
    walletBalance: MOCK_WALLET_BALANCE,
    totalSettlement: settled.reduce((sum, t) => sum + t.amount, 0),
    settledCount: settled.length,
    series,
    performance: TRANSACTION_TYPES.map((type) => {
      const ofType = successful.filter((t) => t.type === type);
      return { type, revenue: ofType.reduce((sum, t) => sum + t.amount, 0), count: ofType.length };
    }),
    recentTransactions: txInRange.slice(0, 7),
  };
}

/**
 * Everything the Overview page shows for a date range.
 *
 * Business counts come from live endpoints (menu items, inventory stats, places, deal stats, event
 * stats, recent events). Money and customer analytics (`analytics`) are SAMPLE DATA from
 * src/mocks/transactions.ts until the backend exposes transaction reporting — swap the `queryFn`
 * for the real endpoint when it exists.
 */
export function useOverview({ from, to }: { from: Date; to: Date }) {
  const analyticsQuery = useQuery<OverviewAnalytics>({
    queryKey: ["overview-analytics", from.toISOString(), to.toISOString()],
    queryFn: () => mockResponse(computeAnalytics(from, to)),
    placeholderData: keepPreviousData,
  });

  const menu = useMenuItemsCount({ status: "AVAILABLE" });
  const inventory = useInventoryStats();
  const places = usePlacesCount();
  const deals = useDealStats();
  const events = useEventStats();
  const recentEvents = useRecentEvents({ limit: 5 });

  return {
    analytics: analyticsQuery.data,
    isAnalyticsLoading: analyticsQuery.isLoading,
    counts: {
      menuItems: menu.count,
      inventoryItems: inventory.stats?.totalItems ?? 0,
      inventoryInStock: inventory.stats?.inStock ?? 0,
      lowStock: inventory.stats?.lowStock ?? 0,
      places: places.count,
      activeDeals: deals.stats?.active ?? 0,
      activeEvents: events.stats?.active ?? 0,
      upcomingEvents: events.stats?.upcoming ?? 0,
    },
    isCountsLoading:
      menu.isLoading || inventory.isLoading || places.isLoading || deals.isLoading || events.isLoading,
    recentEvents: recentEvents.events,
    isRecentEventsLoading: recentEvents.isLoading,
  };
}
