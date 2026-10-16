import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Download, Receipt } from "lucide-react";
import SearchBar from "@/components/search-bar";
import EmptyState from "@/components/empty-state";
import StatusPill from "@/components/status-pill";
import PaginationButton from "@/components/pagination-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { WalletPeriod, WalletTransaction } from "@/hooks/use-wallet-extras";
import { cn } from "@/lib/utils";
import { exportCsv, fmtDateTime, formatAmount } from "@/utils";

const PAGE_SIZE = 10;
const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];
const DIRECTION_OPTIONS = [
  { value: "all", label: "In & Out" },
  { value: "CREDIT", label: "Money In" },
  { value: "DEBIT", label: "Money Out" },
];
const PERIOD_OPTIONS: { value: WalletPeriod; label: string }[] = [
  { value: "year", label: "This Year" },
  { value: "month", label: "This Month" },
  { value: "week", label: "This Week" },
];

/** Downloads a plain-text receipt for one completed transaction. */
function downloadReceipt(tx: WalletTransaction) {
  const lines = [
    "SpinStrip wallet receipt",
    "",
    `Reference: ${tx.ref}`,
    `Date: ${fmtDateTime(tx.createdAt)}`,
    `Type: ${tx.label} (${tx.entry === "CREDIT" ? "money in" : "money out"})`,
    ...(tx.counterparty ? [`Counterparty: ${tx.counterparty}`] : []),
    ...(tx.narration ? [`Narration: ${tx.narration}`] : []),
    `Amount: ${formatAmount(tx.amount)}`,
    `Status: ${tx.status}`,
  ];
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `receipt-${tx.ref}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

const filterSelect = (
  value: string,
  onChange: (value: string) => void,
  options: { value: string; label: string }[],
  width: string
) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className={cn("h-11 rounded-full text-xs font-semibold", width)}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {options.map((o) => (
        <SelectItem key={o.value} value={o.value}>
          {o.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export default function TransactionHistory({
  transactions,
  isLoading,
  period,
  onPeriodChange,
}: {
  transactions: WalletTransaction[];
  isLoading?: boolean;
  period: WalletPeriod;
  onPeriodChange: (period: WalletPeriod) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [direction, setDirection] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return transactions.filter((tx) => {
      const matchesStatus = status === "all" || tx.status === status;
      const matchesDirection = direction === "all" || tx.entry === direction;
      const matchesQuery =
        !query ||
        tx.ref.toLowerCase().includes(query) ||
        tx.label.toLowerCase().includes(query) ||
        (tx.counterparty ?? "").toLowerCase().includes(query) ||
        (tx.narration ?? "").toLowerCase().includes(query);
      return matchesStatus && matchesDirection && matchesQuery;
    });
  }, [transactions, searchQuery, status, direction]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const resetPage = <T,>(set: (value: T) => void) => (value: T) => {
    set(value);
    setPage(1);
  };

  const handleExport = () =>
    exportCsv(
      "wallet-transactions.csv",
      ["Date", "Type", "Direction", "Counterparty", "Narration", "Amount (NGN)", "Status", "Reference"],
      filtered.map((tx) => [
        fmtDateTime(tx.createdAt),
        tx.label,
        tx.entry === "CREDIT" ? "In" : "Out",
        tx.counterparty ?? "",
        tx.narration ?? "",
        tx.amount,
        tx.status,
        tx.ref,
      ])
    );

  return (
    <section className="mt-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="mr-2 font-display text-base font-bold text-foreground">Transaction History</h2>
        <SearchBar
          placeholder="Search reference, counterparty…"
          value={searchQuery}
          onChange={(e) => resetPage(setSearchQuery)(e.target.value)}
        />
        {filterSelect(direction, resetPage(setDirection), DIRECTION_OPTIONS, "w-[130px]")}
        {filterSelect(status, resetPage(setStatus), STATUS_OPTIONS, "w-[140px]")}
        {filterSelect(period, resetPage((v: string) => onPeriodChange(v as WalletPeriod)), PERIOD_OPTIONS, "w-[130px]")}
        <button
          type="button"
          onClick={handleExport}
          disabled={!filtered.length}
          className="ml-auto inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" /> Export
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-11" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Receipt />}
            title="No transactions yet"
            description={
              searchQuery || status !== "all" || direction !== "all"
                ? "No transactions match your search or filters."
                : "Deposits, transfers and withdrawals will appear here."
            }
          />
        ) : (
          <Table className="min-w-[860px]">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Transaction</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((tx) => {
                const isIn = tx.entry === "CREDIT";
                const available = tx.status === "completed";
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {fmtDateTime(tx.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                            isIn ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                          )}
                        >
                          {isIn ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">{tx.label}</p>
                          <p className="max-w-[260px] truncate text-[11px] text-muted-foreground">
                            {tx.counterparty || tx.narration || "—"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      className={cn("whitespace-nowrap font-semibold", isIn ? "text-emerald-600" : "text-foreground")}
                    >
                      {isIn ? "+" : "−"}
                      {formatAmount(tx.amount)}
                    </TableCell>
                    <TableCell>
                      <StatusPill status={tx.status} />
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate font-mono text-[11px] text-muted-foreground">
                      {tx.ref}
                    </TableCell>
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
