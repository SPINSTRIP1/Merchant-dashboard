"use client";

import { useState } from "react";
import { Download, Hash, Receipt, RefreshCw } from "lucide-react";
import EmptyState from "@/components/empty-state";
import PaginationButton from "@/components/pagination-button";
import StatusPill from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import {
  isInProgress,
  ORDER_STATUS_LABELS,
  useMenuOrders,
  type MenuOrder,
  type MenuOrderStatus,
} from "@/hooks/use-menu-orders";
import { cn } from "@/lib/utils";
import { exportCsv, fmtDateTime, formatNaira } from "@/utils";

const PAGE_SIZE = 20;

const STATUS_FILTERS: { value: MenuOrderStatus | null; label: string }[] = [
  { value: null, label: "All" },
  { value: "PENDING", label: ORDER_STATUS_LABELS.PENDING },
  { value: "CONFIRMED", label: ORDER_STATUS_LABELS.CONFIRMED },
  { value: "PROCESSING", label: ORDER_STATUS_LABELS.PROCESSING },
  { value: "COMPLETED", label: ORDER_STATUS_LABELS.COMPLETED },
  { value: "CANCELLED", label: ORDER_STATUS_LABELS.CANCELLED },
  { value: "FAILED", label: ORDER_STATUS_LABELS.FAILED },
];

const PAYMENT_LABELS: Record<string, string> = { PAYSTACK: "Paystack", LEDGER_BLOCK: "Fuspay" };

const paymentLabel = (method: string | null) => (method ? (PAYMENT_LABELS[method] ?? method) : "—");

const tableLabel = (order: MenuOrder) => (order.tableNumber ? `Table ${order.tableNumber}` : "Takeaway");

function OrderStatus({ order }: { order: MenuOrder }) {
  const inProgress = isInProgress(order);
  return (
    <StatusPill
      status={inProgress ? "processing" : order.status}
      label={inProgress ? ORDER_STATUS_LABELS.PROCESSING : (ORDER_STATUS_LABELS[order.status] ?? order.status)}
    />
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function OrderSheet({ order, onClose }: { order: MenuOrder | null; onClose: () => void }) {
  return (
    <Sheet open={!!order} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md">
        {order && (
          <>
            <SheetHeader>
              <SheetTitle>Order {order.displayCode}</SheetTitle>
              <SheetDescription>
                {tableLabel(order)} · placed {fmtDateTime(order.createdAt)}
              </SheetDescription>
            </SheetHeader>

            <div className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3">
              <p className="font-display text-2xl font-bold text-foreground">{formatNaira(order.totalAmount)}</p>
              <OrderStatus order={order} />
            </div>

            <section>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Items</h3>
              <ul className="divide-y rounded-2xl border">
                {order.items.length ? (
                  order.items.map((item, i) => (
                    <li key={`${item.menuItemId}-${i}`} className="flex items-start justify-between gap-3 px-4 py-2.5 text-sm">
                      <span className="text-foreground">
                        <span className="font-semibold">{item.quantity}×</span> {item.name}
                      </span>
                      <span className="shrink-0 font-medium text-foreground">{formatNaira(item.lineTotal)}</span>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-3 text-sm text-muted-foreground">No items on this order.</li>
                )}
              </ul>
            </section>

            <section>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer</h3>
              <div className="divide-y rounded-2xl border px-4">
                <Detail label="Name" value={order.customerName} />
                <Detail label="Email" value={order.email ?? "—"} />
                <Detail label="Phone" value={order.phone ?? "—"} />
              </div>
            </section>

            <section>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment</h3>
              <div className="divide-y rounded-2xl border px-4">
                <Detail label="Method" value={paymentLabel(order.paymentMethod)} />
                <Detail
                  label="Reference"
                  value={<span className="break-all font-mono text-[11px]">{order.transactionRef ?? "—"}</span>}
                />
                {order.completedAt && <Detail label="Completed" value={fmtDateTime(order.completedAt)} />}
                {order.cancelledAt && <Detail label="Cancelled" value={fmtDateTime(order.cancelledAt)} />}
                {order.tablePayout.status !== "NOT_APPLICABLE" && (
                  <Detail
                    label="Table payout"
                    value={
                      <span className="flex flex-col items-end gap-0.5">
                        <StatusPill status={order.tablePayout.status} />
                        {order.tablePayout.amount != null && <span>{formatNaira(order.tablePayout.amount)}</span>}
                        {order.tablePayout.settledAt && (
                          <span className="text-[11px] text-muted-foreground">{fmtDateTime(order.tablePayout.settledAt)}</span>
                        )}
                      </span>
                    }
                  />
                )}
              </div>
            </section>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/** Every restaurant order, whatever its status — Settlement only lists paid ones. */
export default function OrdersTab() {
  const [status, setStatus] = useState<MenuOrderStatus | null>(null);
  const [table, setTable] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<MenuOrder | null>(null);
  const debouncedTable = useDebounce(table, 400);

  const { orders, total, lastPage, isLoading, isFetching, refetch } = useMenuOrders({
    page,
    limit: PAGE_SIZE,
    status,
    tableNumber: debouncedTable,
  });

  const filtersActive = !!status || !!debouncedTable.trim();

  const handleExport = () =>
    exportCsv(
      `orders-page-${page}.csv`,
      ["Order", "Placed", "Customer", "Email", "Phone", "Table", "Items", "Amount (NGN)", "Payment", "Status"],
      orders.map((o) => [
        o.displayCode,
        fmtDateTime(o.createdAt),
        o.customerName,
        o.email ?? "",
        o.phone ?? "",
        tableLabel(o),
        o.items.map((i) => `${i.quantity}x ${i.name}`).join("; "),
        o.totalAmount,
        paymentLabel(o.paymentMethod),
        isInProgress(o) ? ORDER_STATUS_LABELS.PROCESSING : (ORDER_STATUS_LABELS[o.status] ?? o.status),
      ]),
    );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Every order placed on your menu, newest first. Tap an order to see its details.
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn(isFetching && "animate-spin")} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!orders.length}>
            <Download /> Export
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="no-scrollbar -mx-1 flex max-w-full gap-2 overflow-x-auto px-1">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => {
                setStatus(filter.value);
                setPage(1);
              }}
              className={cn(
                "min-h-[40px] shrink-0 rounded-full border px-4 text-xs font-semibold transition-colors",
                status === filter.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:ml-auto sm:w-44">
          <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={table}
            onChange={(e) => {
              setTable(e.target.value);
              setPage(1);
            }}
            placeholder="Table number"
            aria-label="Filter by table number"
            className="h-10 rounded-full pl-9"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : orders.length ? (
          <>
            {/* Phones: cards */}
            <ul className="divide-y md:hidden">
              {orders.map((order) => (
                <li key={order.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(order)}
                    className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {order.displayCode} · {order.customerName}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ") || "—"}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {tableLabel(order)} · {fmtDateTime(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <p className="text-sm font-semibold text-foreground">{formatNaira(order.totalAmount)}</p>
                      <OrderStatus order={order} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            {/* Tablet and up: table */}
            <div className="hidden overflow-x-auto md:block">
              <Table className="min-w-[860px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Placed</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} onClick={() => setSelected(order)} className="cursor-pointer">
                      <TableCell className="font-mono text-[11px] text-muted-foreground">{order.displayCode}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {fmtDateTime(order.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{order.customerName}</TableCell>
                      <TableCell className="text-muted-foreground">{tableLabel(order)}</TableCell>
                      <TableCell className="max-w-[240px] truncate text-muted-foreground">
                        {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ") || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-semibold text-foreground">
                        {formatNaira(order.totalAmount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{paymentLabel(order.paymentMethod)}</TableCell>
                      <TableCell>
                        <OrderStatus order={order} />
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
            icon={<Receipt />}
            title={filtersActive ? "No orders match" : "No orders yet"}
            description={
              filtersActive
                ? "Try another status or table number."
                : "Orders from your menu page and table QR codes will appear here."
            }
          />
        )}
      </div>
      {total > 0 && (
        <p className="mt-2 text-right text-[11px] text-muted-foreground">
          Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()} orders
        </p>
      )}

      <OrderSheet order={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
