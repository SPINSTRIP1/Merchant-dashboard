"use client";

import { useState } from "react";
import Link from "next/link";
import { Doughnut, Line } from "react-chartjs-2";
import {
  AlertTriangle,
  ArrowLeftRight,
  CalendarDays,
  Landmark,
  MapPin,
  Package,
  Tag,
  TrendingDown,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import PageHeader from "@/components/page-header";
import StatCard from "@/components/stat-card";
import ChartCard from "@/components/chart-card";
import StatusPill from "@/components/status-pill";
import EmptyState from "@/components/empty-state";
import DateRangeControl from "@/components/date-range-control";
import SampleDataBadge from "@/components/sample-data-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useOverview } from "@/hooks/use-overview";
import { TRANSACTION_TYPE_LABELS } from "@/mocks/transactions";
import {
  areaDataset,
  doughnutChartOptions,
  doughnutData,
  lineChartOptions,
} from "@/lib/chart-theme";
import { formatNaira, rangeFor, timeAgo, type DateRange } from "@/utils";

export default function OverviewPage() {
  const [range, setRange] = useState<DateRange>(() => rangeFor("month"));
  const { analytics, isAnalyticsLoading, counts, recentEvents, isRecentEventsLoading } =
    useOverview(range);

  const revenueDelta =
    analytics && analytics.revenuePrev > 0
      ? ((analytics.revenue - analytics.revenuePrev) / analytics.revenuePrev) * 100
      : null;

  const revenueByLine = (analytics?.performance ?? [])
    .filter((p) => p.revenue > 0)
    .map((p) => ({ name: TRANSACTION_TYPE_LABELS[p.type], value: p.revenue }));
  const volumeByLine = (analytics?.performance ?? [])
    .filter((p) => p.count > 0)
    .map((p) => ({ name: TRANSACTION_TYPE_LABELS[p.type], value: p.count }));

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="Everything happening across your business, in one glance."
        actions={<DateRangeControl value={range} onChange={setRange} />}
      />

      {isAnalyticsLoading || !analytics ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 11 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          <StatCard
            index={0}
            sample
            label="Total Customers"
            value={analytics.totalCustomers.toLocaleString()}
            sub={`+${analytics.newCustomers} in range`}
            icon={<Users />}
          />
          <StatCard
            index={1}
            sample
            label="Total Transactions"
            value={analytics.totalTransactions.toLocaleString()}
            sub="all channels"
            icon={<ArrowLeftRight />}
          />
          <StatCard
            index={2}
            sample
            accent
            label="Wallet Balance"
            value={formatNaira(analytics.walletBalance)}
            sub="available to settle"
            icon={<Wallet />}
          />
          <StatCard
            index={3}
            sample
            label="Total Revenue"
            value={formatNaira(analytics.revenue, true)}
            sub={
              revenueDelta === null
                ? "in range"
                : `${revenueDelta >= 0 ? "+" : ""}${revenueDelta.toFixed(1)}% vs previous`
            }
            icon={revenueDelta !== null && revenueDelta < 0 ? <TrendingDown /> : <TrendingUp />}
          />
          <StatCard
            index={4}
            sample
            label="Total Settlement"
            value={formatNaira(analytics.totalSettlement, true)}
            sub={`${analytics.settledCount} settled transactions`}
            icon={<Landmark />}
          />
          <StatCard
            index={5}
            label="Total Menu"
            value={counts.menuItems.toLocaleString()}
            sub="available dishes"
            icon={<UtensilsCrossed />}
          />
          <StatCard
            index={6}
            label="Total Inventory"
            value={counts.inventoryItems.toLocaleString()}
            sub={`${counts.inventoryInStock.toLocaleString()} in stock`}
            icon={<Package />}
          />
          <StatCard
            index={7}
            label="Low Stock"
            value={counts.lowStock.toLocaleString()}
            sub="items at or below threshold"
            icon={<AlertTriangle />}
          />
          <StatCard
            index={8}
            label="Places"
            value={counts.places.toLocaleString()}
            sub="listed locations"
            icon={<MapPin />}
          />
          <StatCard
            index={9}
            label="Deals"
            value={counts.activeDeals.toLocaleString()}
            sub="active deals"
            icon={<Tag />}
          />
          <StatCard
            index={10}
            label="Events"
            value={counts.activeEvents.toLocaleString()}
            sub={`${counts.upcomingEvents.toLocaleString()} upcoming`}
            icon={<CalendarDays />}
          />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Total Revenue"
          subtitle="Successful transactions over time"
          action={<SampleDataBadge />}
          delay={0.1}
        >
          <div className="h-[260px]">
            {analytics && (
              <Line
                data={{
                  labels: analytics.series.map((p) => p.label),
                  datasets: [areaDataset("Revenue", analytics.series.map((p) => p.revenue), "chart-1")],
                }}
                options={lineChartOptions({
                  formatY: (v) => formatNaira(v, true),
                  tooltipLabel: (v) => `Revenue: ${formatNaira(v)}`,
                })}
              />
            )}
          </div>
        </ChartCard>
        <ChartCard
          title="Customer Onboarding"
          subtitle="New customers joining over time"
          action={<SampleDataBadge />}
          delay={0.15}
        >
          <div className="h-[260px]">
            {analytics && (
              <Line
                data={{
                  labels: analytics.series.map((p) => p.label),
                  datasets: [
                    areaDataset("New customers", analytics.series.map((p) => p.customers), "chart-2"),
                  ],
                }}
                options={lineChartOptions({
                  integerTicks: true,
                  tooltipLabel: (v) => `${v} new customer${v === 1 ? "" : "s"}`,
                })}
              />
            )}
          </div>
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Product Performance — Revenue"
          subtitle="Share of revenue by product line"
          action={<SampleDataBadge />}
          delay={0.2}
        >
          {revenueByLine.length ? (
            <div className="h-[280px]">
              <Doughnut
                data={doughnutData(revenueByLine)}
                options={doughnutChartOptions({ formatValue: (v) => formatNaira(v) })}
              />
            </div>
          ) : (
            <EmptyState icon={<Tag />} title="No revenue in range" hint="Try a wider date range." />
          )}
        </ChartCard>
        <ChartCard
          title="Product Performance — Volume"
          subtitle="Transaction count by product line"
          action={<SampleDataBadge />}
          delay={0.25}
        >
          {volumeByLine.length ? (
            <div className="h-[280px]">
              <Doughnut
                data={doughnutData(volumeByLine, 2)}
                options={doughnutChartOptions({ formatValue: (v) => `${v} transactions` })}
              />
            </div>
          ) : (
            <EmptyState
              icon={<ArrowLeftRight />}
              title="No transactions in range"
              hint="Try a wider date range."
            />
          )}
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Recent Transactions"
          subtitle="Latest across all channels"
          action={
            <span className="flex items-center gap-2">
              <SampleDataBadge />
              <Link href="/settlement" className="hover:underline">
                View all
              </Link>
            </span>
          }
          delay={0.3}
        >
          {analytics?.recentTransactions.length ? (
            <ul className="divide-y">
              {analytics.recentTransactions.map((tx) => (
                <li key={tx.id} className="flex items-center gap-3 py-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                    {TRANSACTION_TYPE_LABELS[tx.type][0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{tx.itemLabel}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {tx.customerName} · {timeAgo(tx.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-semibold text-foreground">{formatNaira(tx.amount)}</span>
                    <StatusPill status={tx.settled ? "settled" : tx.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<ArrowLeftRight />} title="No transactions in range" />
          )}
        </ChartCard>

        <ChartCard
          title="Recent Events"
          subtitle="Your latest events"
          action={
            <Link href="/apps-tools/event-planner" className="hover:underline">
              Manage
            </Link>
          }
          delay={0.35}
        >
          {isRecentEventsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : recentEvents.length ? (
            <ul className="divide-y">
              {recentEvents.map((event) => {
                const start = new Date(event.startDate);
                return (
                  <li key={event.id ?? event.name} className="flex items-center gap-3 py-2.5">
                    <span className="brand-gradient-soft grid h-10 w-10 shrink-0 place-items-center rounded-xl text-primary">
                      <span className="flex flex-col items-center">
                        <span className="text-sm font-bold leading-none">{start.getDate()}</span>
                        <span className="text-[9px] font-semibold uppercase">
                          {start.toLocaleDateString("en-NG", { month: "short" })}
                        </span>
                      </span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{event.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {[event.city, event.state].filter(Boolean).join(", ")} ·{" "}
                        {event.expectedGuests?.toLocaleString() ?? 0} expected
                      </p>
                    </div>
                    <StatusPill
                      status={event.status ?? "draft"}
                      label={event.status === "INACTIVE" ? "Cancelled" : undefined}
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              icon={<CalendarDays />}
              title="No events yet"
              hint="Events you create will appear here."
              action={
                <Link
                  href="/apps-tools/event-planner"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Create an event
                </Link>
              }
            />
          )}
        </ChartCard>
      </div>
    </>
  );
}
