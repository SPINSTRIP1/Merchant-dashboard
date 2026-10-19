"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Armchair, ConciergeBell, Receipt, ShoppingBag, TrendingUp, Users, UtensilsCrossed } from "lucide-react";
import StatusPill from "@/components/status-pill";
import StatCard from "@/components/stat-card";
import EmptyState from "@/components/empty-state";
import DateRangeControl from "@/components/date-range-control";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  useMenuAnalytics,
  useTableAnalytics,
  useTableAnalyticsDetail,
  useTableOrders,
  type TableAnalytics,
} from "@/hooks/use-menu-analytics";
import { isInProgress } from "@/hooks/use-menu-orders";
import { exportCsv, fmtDateTime, formatNaira, rangeFor, timeAgo, type DateRange } from "@/utils";

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Awaiting payment",
  CONFIRMED: "Paid",
  PROCESSING: "With a waiter",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  FAILED: "Failed",
};

const tableName = (t: Pick<TableAnalytics, "number" | "name">) => (t.name ? `Table ${t.number} · ${t.name}` : `Table ${t.number}`);

function TableOrdersDialog({ table, range, onClose }: { table: TableAnalytics | null; range: DateRange; onClose: () => void }) {
  const { orders, total, isLoading } = useTableOrders(table?.number ?? null);
  const { table: figures } = useTableAnalyticsDetail(table?.tableId ?? null, range);
  const shown = figures ?? table;

  const exportOrders = () =>
    table &&
    exportCsv(
      `table-${table.number}-orders.csv`,
      ["Order", "Date", "Customer", "Items", "Total (NGN)", "Status"],
      orders.map((o) => [
        o.displayCode,
        fmtDateTime(o.createdAt),
        o.customerName,
        o.items.map((i) => `${i.quantity}× ${i.name}`).join("; "),
        o.totalAmount,
        ORDER_STATUS_LABELS[o.status] ?? o.status,
      ])
    );

  return (
    <Dialog open={!!table} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        {table && (
          <>
            <DialogHeader>
              <DialogTitle>{tableName(table)} — orders</DialogTitle>
              <DialogDescription>
                {table.seats} seats · in the selected period: {shown?.guests ?? 0} guests, {shown?.seatings ?? 0} paid
                orders, {formatNaira(shown?.revenue ?? 0)}
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-muted-foreground">
                Latest orders{total > orders.length ? ` (${orders.length} of ${total})` : ""}
              </p>
              <button
                type="button"
                onClick={exportOrders}
                disabled={!orders.length}
                className="inline-flex min-h-[36px] items-center rounded-full border px-4 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
              >
                Export CSV
              </button>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                No orders from this table yet.
              </p>
            ) : (
              <ul className="max-h-[60vh] divide-y overflow-y-auto rounded-2xl border">
                {orders.map((order) => (
                  <li key={order.id} className="flex items-start justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {order.displayCode} · {order.customerName}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ") || "—"}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{fmtDateTime(order.createdAt)}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <p className="text-sm font-semibold text-foreground">{formatNaira(order.totalAmount)}</p>
                      <StatusPill
                        status={isInProgress(order) ? "processing" : order.status}
                        label={isInProgress(order) ? ORDER_STATUS_LABELS.PROCESSING : ORDER_STATUS_LABELS[order.status]}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function TableAnalyticsTab() {
  const [range, setRange] = useState<DateRange>(() => rangeFor("month"));
  const { analytics, isLoading: summaryLoading } = useMenuAnalytics(range);
  const { tables, isLoading: tablesLoading } = useTableAnalytics(range);
  const [selected, setSelected] = useState<TableAnalytics | null>(null);
  const isLoading = summaryLoading || tablesLoading;


  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Paid orders for the selected period, overall and by table.</p>
        <DateRangeControl value={range} onChange={setRange} />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard
              index={0}
              accent
              label="Revenue"
              value={formatNaira(analytics?.revenue ?? 0, true)}
              sub="paid orders"
              icon={<TrendingUp />}
            />
            <StatCard
              index={1}
              label="Paid Orders"
              value={(analytics?.orderCount ?? 0).toLocaleString()}
              sub="dine-in and takeaway"
              icon={<Receipt />}
            />
            <StatCard
              index={2}
              label="Average Order"
              value={formatNaira(analytics?.averageOrderValue ?? 0, true)}
              sub="per paid order"
              icon={<ShoppingBag />}
            />
            <StatCard
              index={3}
              label="Items Sold"
              value={(analytics?.itemsSold ?? 0).toLocaleString()}
              sub={`${formatNaira(analytics?.itemRevenue ?? 0, true)} in item sales`}
              icon={<UtensilsCrossed />}
            />
          </div>

          {tables.length === 0 ? (
            <div className="rounded-2xl border bg-card">
              <EmptyState
                icon={<Armchair />}
                title="No tables yet"
                description="Add tables in the Tables & QR tab. Their orders and revenue appear here."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {tables.map((table, i) => (
                <motion.button
                  key={table.tableId}
                  type="button"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelected(table)}
                  className="card-hover rounded-2xl border bg-card p-5 text-left"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-display text-base font-bold text-foreground">{tableName(table)}</p>
                    <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                      {table.seats} seats
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    {[
                      { icon: Users, value: table.guests, label: "Guests" },
                      { icon: ConciergeBell, value: table.seatings, label: "Paid orders" },
                      { icon: UtensilsCrossed, value: table.orders, label: "Items" },
                    ].map(({ icon: Icon, value, label }) => (
                      <div key={label} className="rounded-xl bg-muted/60 py-2.5">
                        <Icon className="mx-auto h-4 w-4 text-primary" />
                        <p className="mt-1 text-sm font-bold text-foreground">{value.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs">
                    <span className="text-muted-foreground">
                      {table.lastSeatedAt ? `Last order ${timeAgo(table.lastSeatedAt)}` : "No orders in this period"}
                    </span>
                    <span className="font-display font-bold text-primary">{formatNaira(table.revenue, true)}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </>
      )}

      <TableOrdersDialog table={selected} range={range} onClose={() => setSelected(null)} />
    </div>
  );
}
