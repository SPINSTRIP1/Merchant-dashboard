"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, CalendarRange, Clock, Download, Landmark, Wallet } from "lucide-react";
import DateRangeControl from "@/components/date-range-control";
import EmptyState from "@/components/empty-state";
import PageHeader from "@/components/page-header";
import PaginationButton from "@/components/pagination-button";
import SearchBar from "@/components/search-bar";
import StatCard from "@/components/stat-card";
import StatusPill from "@/components/status-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { useSettlementAnalytics, useSettlements, type SettlementPeriod } from "@/hooks/use-settlements";
import { cn } from "@/lib/utils";
import { exportCsv, fmtDate, fmtDateTime, formatNaira, rangeFor, type DateRange } from "@/utils";

const PAGE_SIZE = 20;

const PERIOD_CARDS: { key: SettlementPeriod; label: string; icon: React.ReactNode }[] = [
  { key: "last7Days", label: "Last 7 days", icon: <Clock /> },
  { key: "last30Days", label: "Last 30 days", icon: <CalendarRange /> },
  { key: "thisMonth", label: "This month", icon: <CalendarDays /> },
  { key: "lastMonth", label: "Last month", icon: <Wallet /> },
];

export default function SettlementPage() {
  // null = all time.
  const [range, setRange] = useState<DateRange | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const { periods, days, isLoading: analyticsLoading } = useSettlementAnalytics({ dailyDays: 7 });
  const { settlements, summary, total, lastPage, isLoading } = useSettlements({
    page,
    limit: PAGE_SIZE,
    from: range?.from,
    to: range?.to,
    search: debouncedSearch,
  });

  const filtersActive = !!range || !!debouncedSearch.trim();

  const handleExport = () =>
    exportCsv(
      `settlements-page-${page}.csv`,
      ["Reference", "Type", "Item", "Customer", "Amount (NGN)", "Settled On", "Status"],
      settlements.map((row) => [row.reference, row.type, row.item, row.customer, row.amount, fmtDateTime(row.settledOn), row.status]),
    );

  return (
    <>
      <PageHeader
        title="Settlement"
        subtitle="Restaurant orders settle as soon as the guest's payment is confirmed."
        actions={
          <Button variant="outline" onClick={handleExport} disabled={!settlements.length}>
            <Download /> Export
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {PERIOD_CARDS.map(({ key, label, icon }, i) =>
          analyticsLoading ? (
            <Skeleton key={key} className="h-[104px] rounded-2xl" />
          ) : (
            <StatCard
              key={key}
              index={i}
              accent={i === 0}
              label={label}
              value={formatNaira(periods[key]?.totalAmount ?? 0)}
              sub={`${(periods[key]?.count ?? 0).toLocaleString()} settled`}
              icon={icon}
            />
          ),
        )}
      </div>

      {days.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-bold text-foreground">Daily settlements · last 7 days</h2>
          <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
            {days.map((day, i) => (
              <motion.button
                key={day.date}
                type="button"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => {
                  // Show that day's settlements in the table.
                  const from = new Date(`${day.date}T00:00:00`);
                  const to = new Date(`${day.date}T23:59:59.999`);
                  setRange({ preset: "custom", from, to });
                  setPage(1);
                }}
                className="min-w-[170px] rounded-2xl border bg-card p-4 text-left transition-colors hover:border-primary/40"
              >
                <p className="text-xs font-medium text-muted-foreground">{fmtDate(`${day.date}T00:00:00`)}</p>
                <p className="mt-1 font-display text-xl font-bold text-primary">{formatNaira(day.totalAmount)}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {day.count} order{day.count === 1 ? "" : "s"}
                </p>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setRange(null);
            setPage(1);
          }}
          className={cn(
            "min-h-[44px] rounded-full border px-4 text-xs font-semibold transition-colors",
            !range ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          All time
        </button>
        <DateRangeControl
          value={range ?? rangeFor("month")}
          onChange={(next) => {
            setRange(next);
            setPage(1);
          }}
          className={cn(!range && "opacity-70")}
        />
        <SearchBar
          placeholder="Search reference, customer, item…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <p className="ml-auto text-xs text-muted-foreground">
          {summary.count.toLocaleString()} settled ·{" "}
          <span className="font-semibold text-foreground">{formatNaira(summary.totalAmount)}</span>
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border bg-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : settlements.length ? (
          <>
            <div className="overflow-x-auto">
              <Table className="min-w-[760px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Settled on</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settlements.map((row) => (
                    <TableRow key={row.orderId}>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">{row.reference}</TableCell>
                      <TableCell className="max-w-[260px] truncate font-medium text-foreground">{row.item}</TableCell>
                      <TableCell className="text-muted-foreground">{row.customer}</TableCell>
                      <TableCell className="font-semibold text-foreground">{formatNaira(row.amount)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmtDateTime(row.settledOn)}</TableCell>
                      <TableCell>
                        <StatusPill status={row.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {lastPage > 1 && (
              <div className="border-t">
                <PaginationButton currentPage={page} totalPages={lastPage} onPageChange={setPage} />
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<Landmark />}
            title={filtersActive ? "No settlements match" : "No settlements yet"}
            description={
              filtersActive
                ? "Try another date range or search."
                : "Restaurant orders appear here once the guest's payment is confirmed."
            }
          />
        )}
      </div>
      {total > 0 && (
        <p className="mt-2 text-right text-[11px] text-muted-foreground">
          Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()}
        </p>
      )}
    </>
  );
}
