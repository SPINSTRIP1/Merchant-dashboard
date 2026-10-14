"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, Landmark } from "lucide-react";
import PageHeader from "@/components/page-header";
import SearchBar from "@/components/search-bar";
import StatusPill from "@/components/status-pill";
import EmptyState from "@/components/empty-state";
import PaginationButton from "@/components/pagination-button";
import SampleDataBadge from "@/components/sample-data-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSettlements } from "@/hooks/use-settlements";
import { TRANSACTION_TYPES, TRANSACTION_TYPE_LABELS, type TransactionType } from "@/mocks/transactions";
import { cn } from "@/lib/utils";
import { exportCsv, fmtDate, fmtDateTime, formatNaira } from "@/utils";

const PAGE_SIZE = 20;

export default function SettlementPage() {
  const { rows, batches, isLoading } = useSettlements();
  const [type, setType] = useState<TransactionType | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter(
      (row) =>
        (type === "all" || row.type === type) &&
        (!query ||
          row.ref.toLowerCase().includes(query) ||
          row.customerName.toLowerCase().includes(query) ||
          row.itemLabel.toLowerCase().includes(query))
    );
  }, [rows, type, search]);

  const total = filtered.reduce((sum, row) => sum + row.amount, 0);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExport = () =>
    exportCsv(
      "settlements.csv",
      ["Reference", "Type", "Item", "Customer", "Amount (NGN)", "Paid On", "Settled On"],
      filtered.map((row) => [
        row.ref,
        TRANSACTION_TYPE_LABELS[row.type],
        row.itemLabel,
        row.customerName,
        row.amount,
        fmtDateTime(row.createdAt),
        fmtDateTime(row.settledAt),
      ])
    );

  return (
    <>
      <PageHeader
        title="Settlement"
        subtitle="Settled transactions across every product line. Payments settle the next business day (T+1)."
        actions={
          <>
            <SampleDataBadge />
            <Button variant="outline" onClick={handleExport} disabled={!filtered.length}>
              <Download /> Export
            </Button>
          </>
        }
      />

      {isLoading ? (
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 min-w-[190px] rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
          {batches.slice(0, 10).map((batch, i) => (
            <motion.div
              key={batch.date}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="min-w-[190px] rounded-2xl border bg-card p-4"
            >
              <p className="text-xs font-medium text-muted-foreground">{fmtDate(`${batch.date}T00:00:00`)}</p>
              <p className="mt-1 font-display text-xl font-bold text-primary">
                {formatNaira(batch.amount, true)}
              </p>
              <p className="mt-1 truncate text-[11px] text-muted-foreground">
                {batch.count} txns ·{" "}
                {Object.keys(batch.byType)
                  .map((t) => TRANSACTION_TYPE_LABELS[t as TransactionType])
                  .join(", ")}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {(["all", ...TRANSACTION_TYPES] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setType(key);
                setPage(1);
              }}
              className={cn(
                "min-h-[36px] rounded-full px-3.5 text-xs font-semibold transition-colors",
                type === key
                  ? "bg-primary text-primary-foreground"
                  : "border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {key === "all" ? "All Types" : TRANSACTION_TYPE_LABELS[key]}
            </button>
          ))}
        </div>
        <SearchBar
          placeholder="Search ref, customer, item…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <p className="ml-auto text-xs text-muted-foreground">
          {filtered.length.toLocaleString()} settled ·{" "}
          <span className="font-semibold text-foreground">{formatNaira(total, true)}</span>
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border bg-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : filtered.length ? (
          <>
            <Table className="min-w-[820px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Settled On</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">{row.ref}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                        {TRANSACTION_TYPE_LABELS[row.type]}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{row.itemLabel}</TableCell>
                    <TableCell className="text-muted-foreground">{row.customerName}</TableCell>
                    <TableCell className="font-semibold text-foreground">{formatNaira(row.amount)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{fmtDateTime(row.settledAt)}</TableCell>
                    <TableCell>
                      <StatusPill status="settled" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="border-t">
                <PaginationButton currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<Landmark />}
            title="No settled transactions"
            hint={
              search || type !== "all"
                ? "Nothing matches these filters."
                : "Settlements appear here once transactions clear (T+1)."
            }
          />
        )}
      </div>
    </>
  );
}
