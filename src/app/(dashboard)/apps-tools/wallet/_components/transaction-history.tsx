import { useMemo, useState } from "react";
import { Download, Receipt } from "lucide-react";
import SearchBar from "@/components/search-bar";
import EmptyState from "@/components/empty-state";
import StatusPill from "@/components/status-pill";
import PaginationButton from "@/components/pagination-button";
import SampleDataBadge from "@/components/sample-data-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { WalletPeriod, WalletTransaction } from "@/hooks/use-wallet-extras";
import { fmtDateTime, formatAmount } from "@/utils";

const PAGE_SIZE = 10;
const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "success", label: "Successful" },
  { value: "settled", label: "Settled" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];
const PERIOD_OPTIONS: { value: WalletPeriod; label: string }[] = [
  { value: "year", label: "This Year" },
  { value: "month", label: "This Month" },
  { value: "week", label: "This Week" },
];

/** Downloads a plain-text receipt for one transaction. */
function downloadReceipt(tx: WalletTransaction) {
  const lines = [
    "SpinStrip payment receipt",
    "",
    `Reference: ${tx.ref}`,
    `Date: ${fmtDateTime(tx.createdAt)}`,
    `Customer: ${tx.customerName}`,
    `Item: ${tx.itemLabel}`,
    `Amount: ${formatAmount(tx.amount)}`,
    `Payment method: ${tx.paymentMethod}`,
    `Status: ${tx.settled ? "Settled" : tx.status}`,
  ];
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `receipt-${tx.ref}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function TransactionHistory({
  transactions,
  period,
  onPeriodChange,
}: {
  transactions: WalletTransaction[];
  period: WalletPeriod;
  onPeriodChange: (period: WalletPeriod) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return transactions.filter((tx) => {
      const matchesStatus =
        status === "all" ||
        (status === "settled" ? tx.settled : tx.status === status && (status !== "success" || !tx.settled));
      const matchesQuery =
        !query ||
        tx.ref.toLowerCase().includes(query) ||
        tx.customerName.toLowerCase().includes(query) ||
        tx.itemLabel.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [transactions, searchQuery, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="mt-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="mr-2 flex items-center gap-2 font-display text-base font-bold text-foreground">
          Transaction History <SampleDataBadge />
        </h2>
        <SearchBar
          placeholder="Search ref, customer, item…"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
        />
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-11 w-[140px] rounded-full text-xs font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={period}
          onValueChange={(value) => {
            onPeriodChange(value as WalletPeriod);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-11 w-[130px] rounded-full text-xs font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        {rows.length === 0 ? (
          <EmptyState
            icon={<Receipt />}
            title="No transactions yet"
            description={
              searchQuery || status !== "all"
                ? "No transactions match your search or filters."
                : "Transactions will appear here when customers pay your business."
            }
          />
        ) : (
          <Table className="min-w-[860px]">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead className="text-right">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((tx) => {
                const available = tx.status === "success";
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {fmtDateTime(tx.createdAt)}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{tx.itemLabel}</p>
                      <p className="text-[11px] text-muted-foreground">{tx.customerName}</p>
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">{formatAmount(tx.amount)}</TableCell>
                    <TableCell>
                      <StatusPill
                        status={tx.settled ? "settled" : tx.status}
                        label={tx.settled ? "Settled" : tx.status === "success" ? "Successful" : undefined}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{tx.paymentMethod}</TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">{tx.ref}</TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        disabled={!available}
                        onClick={() => downloadReceipt(tx)}
                        className="inline-flex min-h-[32px] items-center gap-1 rounded-full border px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:text-muted-foreground disabled:opacity-60"
                      >
                        <Download className="h-3.5 w-3.5" /> {available ? "Download" : "Unavailable"}
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        {totalPages > 1 && (
          <div className="border-t">
            <PaginationButton currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </section>
  );
}
