"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Armchair, ConciergeBell, Receipt, ShoppingBag, TrendingUp, UtensilsCrossed } from "lucide-react";
import StatusPill from "@/components/status-pill";
import StatCard from "@/components/stat-card";
import EmptyState from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTableOrderStats, type TableOrderStats } from "@/hooks/use-menu-orders";
import { exportCsv, fmtDateTime, formatNaira, timeAgo } from "@/utils";

const tableName = (t: Pick<TableOrderStats, "tableNumber">) => (t.tableNumber ? `Table ${t.tableNumber}` : "Takeaway");

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Awaiting payment",
  CONFIRMED: "Paid",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  FAILED: "Failed",
};

export default function TableAnalyticsTab() {
  const { tables, totals, totalOrders, isTruncated, isLoading } = useTableOrderStats();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const selected = tables.find((t) => t.tableNumber === selectedKey) ?? null;

  const exportSelected = (table: TableOrderStats) =>
    exportCsv(
      `${tableName(table).toLowerCase().replace(/\s+/g, "-")}-orders.csv`,
      ["Order", "Date", "Customer", "Items", "Total (NGN)", "Status"],
      table.orders.map((o) => [
        o.displayCode,
        fmtDateTime(o.createdAt),
        o.customerName,
        o.items.map((i) => `${i.quantity}× ${i.name}`).join("; "),
        o.totalAmount,
        ORDER_STATUS_LABELS[o.status] ?? o.status,
      ])
    );

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Orders guests placed from your table QR codes on the public menu, grouped by table number.
        {isTruncated && ` Showing your latest ${tables.reduce((n, t) => n + t.orderCount, 0)} of ${totalOrders} orders.`}
      </p>

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
      ) : tables.length === 0 ? (
        <div className="rounded-2xl border bg-card">
          <EmptyState
            icon={<Armchair />}
            title="No orders yet"
            description="When guests scan a table QR code and order, each table's orders and revenue show up here."
          />
        </div>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard index={0} label="Orders" value={totalOrders.toLocaleString()} icon={<Receipt />} />
            <StatCard
              index={1}
              accent
              label="Dine-in Revenue"
              value={formatNaira(totals.dineInRevenue, true)}
              sub="paid table orders"
              icon={<TrendingUp />}
            />
            <StatCard
              index={2}
              label="Takeaway Revenue"
              value={formatNaira(totals.takeawayRevenue, true)}
              sub="paid orders without a table"
              icon={<ShoppingBag />}
            />
            <StatCard
              index={3}
              label="Busiest Table"
              value={totals.busiest ? tableName(totals.busiest) : "—"}
              sub={totals.busiest ? `${totals.busiest.paidCount} paid orders` : "no dine-in orders yet"}
              icon={<Armchair />}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {tables.map((table, i) => (
              <motion.button
                key={table.tableNumber || "takeaway"}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedKey(table.tableNumber)}
                className="card-hover rounded-2xl border bg-card p-5 text-left"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-base font-bold text-foreground">{tableName(table)}</p>
                  {table.inProgress > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                      <ConciergeBell className="h-3 w-3" /> {table.inProgress} with a waiter
                    </span>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[
                    { icon: Receipt, value: table.paidCount.toLocaleString(), label: "Paid orders" },
                    { icon: UtensilsCrossed, value: table.itemsSold.toLocaleString(), label: "Items sold" },
                    { icon: TrendingUp, value: formatNaira(table.averageOrder, true), label: "Avg order" },
                  ].map(({ icon: Icon, value, label }) => (
                    <div key={label} className="rounded-xl bg-muted/60 py-2.5">
                      <Icon className="mx-auto h-4 w-4 text-primary" />
                      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
                      <p className="text-[10px] text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
                {table.topItem && (
                  <p className="mt-3 truncate text-xs text-muted-foreground">
                    Top dish: <span className="font-semibold text-foreground">{table.topItem}</span>
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs">
                  <span className="text-muted-foreground">
                    {table.lastOrderAt ? `Last order ${timeAgo(table.lastOrderAt)}` : "No orders yet"}
                  </span>
                  <span className="font-display font-bold text-primary">{formatNaira(table.revenue, true)}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelectedKey(null)}>
        <DialogContent className="sm:max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{tableName(selected)} — orders</DialogTitle>
                <DialogDescription>
                  {selected.orderCount} order{selected.orderCount === 1 ? "" : "s"} · {formatNaira(selected.revenue)} paid
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => exportSelected(selected)}
                  className="inline-flex min-h-[36px] items-center rounded-full border px-4 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Export CSV
                </button>
              </div>
              <ul className="max-h-[60vh] divide-y overflow-y-auto rounded-2xl border">
                {selected.orders.map((order) => (
                  <li key={order.id} className="flex items-start justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {order.displayCode} · {order.customerName}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ") || "—"}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {fmtDateTime(order.createdAt)}
                        {order.waiterAssignment === "ACCEPTED" && " · with a waiter"}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <p className="text-sm font-semibold text-foreground">{formatNaira(order.totalAmount)}</p>
                      <StatusPill status={order.status} label={ORDER_STATUS_LABELS[order.status]} />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
