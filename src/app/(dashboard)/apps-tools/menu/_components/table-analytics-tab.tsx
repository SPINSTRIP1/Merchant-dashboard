"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Armchair, Receipt, Users } from "lucide-react";
import StatusPill from "@/components/status-pill";
import SampleDataBadge from "@/components/sample-data-badge";
import EmptyState from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMenuTables, useTableDetail } from "@/hooks/use-menu-tables";
import { fmtDateTime, formatNaira, timeAgo } from "@/utils";

export default function TableAnalyticsTab() {
  const { tables, isLoading } = useMenuTables();
  const [selected, setSelected] = useState<string | null>(null);
  const { detail, isLoading: isDetailLoading } = useTableDetail(selected);

  return (
    <div>
      <p className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        All-time activity per table. Select a table to see its orders and seatings.
        <SampleDataBadge />
      </p>

      {!isLoading && tables.length === 0 ? (
        <div className="rounded-2xl border bg-card">
          <EmptyState icon={<Armchair />} title="No tables yet" hint="Add tables in the Tables & QR tab." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)
            : tables.map((table, i) => (
                <motion.button
                  key={table.id}
                  type="button"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelected(table.id)}
                  className="card-hover rounded-2xl border bg-card p-5 text-left"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-display text-base font-bold text-foreground">{table.label}</p>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                      {table.seats} seats
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    {[
                      { icon: Users, value: table.totalGuests, label: "Guests" },
                      { icon: Armchair, value: table.totalSeatings, label: "Seatings" },
                      { icon: Receipt, value: table.txnCount, label: "Orders" },
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
                      {table.lastSeatedAt ? `Last seated ${timeAgo(table.lastSeatedAt)}` : "No seatings yet"}
                    </span>
                    <span className="font-display font-bold text-primary">{formatNaira(table.revenue, true)}</span>
                  </div>
                </motion.button>
              ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{detail?.table.label ?? "Table"} — activity</DialogTitle>
          </DialogHeader>
          {isDetailLoading || !detail ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h4 className="mb-2 text-sm font-bold text-foreground">Orders</h4>
                {detail.transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders yet.</p>
                ) : (
                  <ul className="divide-y rounded-2xl border">
                    {detail.transactions.map((tx) => (
                      <li key={tx.id} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{tx.itemLabel}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {tx.ref} · {fmtDateTime(tx.createdAt)}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <p className="text-sm font-semibold text-foreground">{formatNaira(tx.amount)}</p>
                          <StatusPill status={tx.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h4 className="mb-2 text-sm font-bold text-foreground">Recent seatings</h4>
                {detail.seatings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No seatings recorded yet.</p>
                ) : (
                  <ul className="divide-y rounded-2xl border">
                    {detail.seatings.slice(0, 12).map((seating) => (
                      <li key={seating.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                        <span className="inline-flex items-center gap-2 text-foreground">
                          <Users className="h-3.5 w-3.5 text-primary" /> {seating.guests} guest
                          {seating.guests === 1 ? "" : "s"}
                        </span>
                        <span className="text-xs text-muted-foreground">{fmtDateTime(seating.seatedAt)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
